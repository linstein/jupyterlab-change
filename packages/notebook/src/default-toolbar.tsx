// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget } from '@lumino/widgets';
import * as React from 'react';

import {
  showDialog,
  Dialog,
  Toolbar,
  ToolbarButtonComponent,
  UseSignal,
  addToolbarButtonClass,
  ReactWidget,
  ToolbarButton,
  ISessionContextDialogs,
  ISessionContext,
  sessionContextDialogs
} from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import * as nbformat from '@jupyterlab/nbformat';
import {
  addIcon,
  copyIcon,
  cutIcon,
  fastForwardIcon,
  HTMLSelect,
  pasteIcon,
  runIcon,
  saveIcon
} from '@jupyterlab/ui-components';

import { NotebookActions } from './actions';
import { NotebookPanel } from './panel';
import { Notebook } from './widget';

/**
 * The class name added to toolbar cell type dropdown wrapper.
 */
const TOOLBAR_CELLTYPE_CLASS = 'jp-Notebook-toolbarCellType';

/**
 * The class name added to toolbar cell type dropdown.
 */
const TOOLBAR_CELLTYPE_DROPDOWN_CLASS = 'jp-Notebook-toolbarCellTypeDropdown';

/**
 * A namespace for the default toolbar items.
 */
export namespace ToolbarItems {
  /**
   * Create save button toolbar item.
   */
  export function createSaveButton(panel: NotebookPanel): Widget {
    function onClick() {
      if (panel.context.model.readOnly) {
        return showDialog({
          title: 'Cannot Save',
          body: 'Document is read-only',
          buttons: [Dialog.okButton()]
        });
      }
      void panel.context.save().then(() => {
        if (!panel.isDisposed) {
          return panel.context.createCheckpoint();
        }
      });
    }
    return addToolbarButtonClass(
      ReactWidget.create(
        <UseSignal signal={panel.context.fileChanged}>
          {() => (
            <ToolbarButtonComponent
              icon={saveIcon}
              onClick={onClick}
              tooltip="Save the notebook contents and create checkpoint"
              enabled={
                !!(
                  panel &&
                  panel.context &&
                  panel.context.contentsModel &&
                  panel.context.contentsModel.writable
                )
              }
            />
          )}
        </UseSignal>
      )
    );
  }

  /**
   * Create an insert toolbar item.
   */
  export function createInsertButton(panel: NotebookPanel): Widget {
    return new ToolbarButton({
      icon: addIcon,
      onClick: () => {
        NotebookActions.insertBelow(panel.content,'code',panel.comm);
      },
      tooltip: 'Insert a code cell below'
    });
  }

  /**
   * Create a cut toolbar item.
   */
  export function createCutButton(panel: NotebookPanel): Widget {
    return new ToolbarButton({
      icon: cutIcon,
      onClick: () => {
        NotebookActions.cut(panel.content,panel.comm);
      },
      tooltip: 'Cut the selected cells'
    });
  }

  /**
   * Create a copy toolbar item.
   */
  export function createCopyButton(panel: NotebookPanel): Widget {
    return new ToolbarButton({
      icon: copyIcon,
      onClick: () => {
        NotebookActions.copy(panel.content,panel.comm);
      },
      tooltip: 'Copy the selected cells'
    });
  }

  /**
   * Create a paste toolbar item.
   */
  export function createPasteButton(panel: NotebookPanel): Widget {
    return new ToolbarButton({
      icon: pasteIcon,
      onClick: () => {
        NotebookActions.paste(panel.content);
      },
      tooltip: 'Paste cells from the clipboard'
    });
  }

  /**
   * Create a run toolbar item.
   */
  export function createRunButton(panel: NotebookPanel): Widget {
    return new ToolbarButton({
      icon: runIcon,
      onClick: () => {
        void NotebookActions.runAndAdvance(panel.comm,panel.content, panel.sessionContext);
      },
      tooltip: 'Run the selected cells and advance'
    });
  }
  /**
   * Create a restart run all toolbar item
   */
  export function createRestartRunAllButton(
    panel: NotebookPanel,
    dialogs?: ISessionContext.IDialogs
  ): Widget {
    return new ToolbarButton({
      icon: fastForwardIcon,
      onClick: () => {
        void (dialogs ?? sessionContextDialogs)
          .restart(panel.sessionContext)
          .then(restarted => {
            if (restarted) {
              void NotebookActions.runAll(panel.comm,panel.content, panel.sessionContext);
            }
            return restarted;
          });
      },
      tooltip: 'Restart the kernel, then re-run the whole notebook'
    });
  }

  export function createRunAllButton(
    panel: NotebookPanel,
  ): Widget {
    return new ToolbarButton({
      icon: runIcon,
      onClick: () => {
        void NotebookActions.runAll(panel.comm,panel.content, panel.sessionContext);
      },
      tooltip: 'Run  all cells'
    });
  }

  export function createInsertMarkdownButton(
    panel: NotebookPanel,
  ): Widget {
    return new ToolbarButton({
      icon: addIcon,
      onClick: () => {
        NotebookActions.insertBelow(panel.content,'markdown',panel.comm);
      },
      tooltip: 'Insert a markdown cell below'
    });
  }

  export class KernelInfo extends Widget{
  /**
   * Construct a KernelInfo.
   */
    constructor() {
      super();
      this.addClass("KernelInfo");
      var a=document.createElement("text");
      var img=document.createElement("img");
      img.src="";
      // Object.assign(this.node,{id:"kenelInfo_tool"});
      // Object.assign(this.node.style, {height:"20px"});
      Object.assign(a.style, {float:"right","line-height": "1.8"});
      Object.assign(img.style, {float:"right", "border-radius":"70%", "height": "24px", "overflow":"hidden"});
      a.innerText="空闲中";
      this.node.appendChild(a);
      this.node.appendChild(img);

    }
  }

  export function createKernelInfo(
  ): Widget {
    return new KernelInfo
  }

  export function createDeleteKernel(
      panel:NotebookPanel
  ): Widget {
    return new ToolbarButton({
      icon: pasteIcon,
      onClick: () => {
        panel.sessionContext.sessionManager.shutdown(panel.sessionContext.session!.id).catch(reason => {
          console.error(`Kernel not shut down ${reason}`);
        });
      },
      tooltip: 'Delete current kernel'
    });
  }

  /**
   * Create a cell type switcher item.
   *
   * #### Notes
   * It will display the type of the current active cell.
   * If more than one cell is selected but are of different types,
   * it will display `'-'`.
   * When the user changes the cell type, it will change the
   * cell types of the selected cells.
   * It can handle a change to the context.
   */
  export function createCellTypeItem(panel: NotebookPanel): Widget {
    return new CellTypeSwitcher(panel);
  }

  /**
   * Get the default toolbar items for panel
   */
  export function getDefaultItems(
    panel: NotebookPanel,
    sessionDialogs?: ISessionContextDialogs
  ): DocumentRegistry.IToolbarItem[] {
    return [
      { name: 'save', widget: createSaveButton(panel) },
      { name: 'insert', widget: createInsertButton(panel) },
      { name: 'insertMarkdown', widget: createInsertMarkdownButton(panel) },
      { name: 'cut', widget: createCutButton(panel) },
      // { name: 'copy', widget: createCopyButton(panel) },
      // { name: 'paste', widget: createPasteButton(panel) },
      { name: 'run', widget: createRunButton(panel) },
      {
        name: 'restart',
        widget: Toolbar.createRestartButton(
          panel.sessionContext,
          sessionDialogs
        )
      },
      // {
      //   name: 'restart-and-run',
      //   widget: createRestartRunAllButton(panel, sessionDialogs)
      // },
      {
        name: 'runAll',
        widget: createRunAllButton(panel)
      },
      { name: 'cellType', widget: createCellTypeItem(panel) },
      { name: 'spacer', widget: Toolbar.createSpacerItem() },
      {
        name: 'kernelStatus',
        widget: Toolbar.createKernelStatusItem(panel.sessionContext)
      },
      {name: "kernelInfo",widget: createKernelInfo()},
      {
        name: 'interrupt',
        widget: Toolbar.createInterruptButton(panel.sessionContext)
      },
      {
        name: 'delete',
        widget: createDeleteKernel(panel)
      },
      // {
      //   name: 'kernelName',
      //   widget: Toolbar.createKernelNameItem(
      //     panel.sessionContext,
      //     sessionDialogs
      //   )
      // }
    ];
  }
}

/**
 * A toolbar widget that switches cell types.
 */
export class CellTypeSwitcher extends ReactWidget {
  /**
   * Construct a new cell type switcher.
   */
  constructor(widget: NotebookPanel) {
    super();
    this.addClass(TOOLBAR_CELLTYPE_CLASS);
    this.panel=widget;
    this._notebook = widget.content;
    if (widget.content.model) {
      this.update();
    }
    widget.content.activeCellChanged.connect(this.update, this);
    // Follow a change in the selection.
    widget.content.selectionChanged.connect(this.update, this);
  }

  /**
   * Handle `change` events for the HTMLSelect component.
   */
  handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (event.target.value !== '-') {
      NotebookActions.changeCellType(
        this._notebook,
        event.target.value as nbformat.CellType,
        this.panel.comm
      );
      this._notebook.activate();
    }
  };

  /**
   * Handle `keydown` events for the HTMLSelect component.
   */
  handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.keyCode === 13) {
      this._notebook.activate();
    }
  };

  render() {
    let value = '-';
    if (this._notebook.activeCell) {
      value = this._notebook.activeCell.model.type;
    }
    for (const widget of this._notebook.widgets) {
      if (this._notebook.isSelectedOrActive(widget)) {
        if (widget.model.type !== value) {
          value = '-';
          break;
        }
      }
    }
    return (
      <HTMLSelect
        className={TOOLBAR_CELLTYPE_DROPDOWN_CLASS}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        value={value}
        aria-label="Cell type"
      >
        <option value="-">-</option>
        <option value="code">Code</option>
        <option value="markdown">Markdown</option>
        <option value="raw">Raw</option>
      </HTMLSelect>
    );
  }

  private _notebook: Notebook;
  private panel:NotebookPanel;
}
