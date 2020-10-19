/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import { Widget } from '@lumino/widgets';

/**
 * The CSS class added to the cell header.
 */
const CELL_HEADER_CLASS = 'jp-CellHeader';

/**
 * The CSS class added to the cell footer.
 */
const CELL_FOOTER_CLASS = 'jp-CellFooter';

/**
 * The interface for a cell header.
 */
export interface ICellHeader extends Widget {}

/**
 * Default implementation of a cell header.
 */
//实现cell的header部分
export class CellHeader extends Widget implements ICellHeader {
  /**
   * Construct a new cell header.
   */
  constructor() {
    super();
    this.addClass(CELL_HEADER_CLASS);
    var run_button=document.createElement("div");
    Object.assign(run_button.style, {width:"auto","float":"left"});
    this.node.appendChild(run_button);

    var cellinfo=document.createElement("div");
    // cellinfo.addClass("CodeMirror-sizer");
    Object.assign(run_button.style, {height:"30px"});

    Object.assign(cellinfo.style, {"border":"1px solid #e0e0e0","float":'right',"height":"30px"});
    cellinfo.className="CodeMirror-sizer";


    var save_button=document.createElement("a");
    var cut_button=document.createElement("a");
    Object.assign(save_button.style, {"text-decoration":"underline","margin-right": "2px","line-height": "1.8","color":"blue"});
    Object.assign(cut_button.style, {"text-decoration":"underline","margin-right": "2px","line-height": "1.8","color":"blue"});
    save_button.innerText="保存";
    save_button.onclick=()=>{
      //回调，执行页面保存操作
  //    this.saveCell();
      console.log("save cell00000000000000000000000000000000000")
    };
    cut_button.innerText="删除";
    cut_button.onclick=()=>{
      //回调，执行cell删除;
//      this.cutCell();
      console.log("delete cell00000000000000000000000000000000000")
    };
    cellinfo.appendChild(save_button);
    cellinfo.appendChild(cut_button);

    var a=document.createElement("text");
    var img=document.createElement("img");
    img.src="";
    Object.assign(this.node.style, {height:"30px",'display':"none"});
    Object.assign(a.style, {float:"right","line-height": "1.8"});
    Object.assign(img.style, {float:"right", "border-radius":"70%", "height": "30px", "overflow":"hidden"});
    a.innerText="";
    cellinfo.appendChild(img);
    cellinfo.appendChild(a);

    this.node.appendChild(cellinfo);
  }

}

/**
 * The interface for a cell footer.
 */
//实现cell的footer部分
export interface ICellFooter extends Widget {}

/**
 * Default implementation of a cell footer.
 */
export class CellFooter extends Widget implements ICellFooter {
  /**
   * Construct a new cell footer.
   */
  constructor() {
    super();
    this.addClass(CELL_FOOTER_CLASS);
  }
}

export class cutSaveCell{
  _cutCell: () => void | PromiseLike<void>;

  set cutCell(cb: () => void | PromiseLike<void>){
    this._cutCell = cb;
  }

  get cutCell(): () => void | PromiseLike<void>{
    return this._cutCell;
  }

  _saveCell: () => void | PromiseLike<void>;

  set saveCell(cb: () => void | PromiseLike<void>){
    this._saveCell = cb;
  }
  get saveCell(): () => void | PromiseLike<void>{
    return this._saveCell;
  }
}
