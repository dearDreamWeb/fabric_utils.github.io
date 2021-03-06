import React, { useEffect, useState } from "react";
import styles from "./canvasContent.module.less";
import { fabric } from "fabric";
import { Canvas } from "fabric/fabric-impl";
import { FilterItem } from "../../App";
import assetImg from "../../assets/images/880.jpeg";

interface IProps {
  activeKey: string;
  filters: FilterItem[];
}

function CanvasContent(props: IProps): JSX.Element {
  const { activeKey, filters } = props;
  const [canvas, setCanvas] = useState<Canvas>();

  useEffect(() => {
    const canvasDom = new fabric.Canvas("canvas");
    setCanvas(canvasDom);
  }, []);

  /**
   * 滤镜
   */
  useEffect(() => {
    if (!canvas || !canvas.getActiveObject()) {
      return;
    }
    fabric.filterBackend = new fabric.Canvas2dFilterBackend();
    fabric.Object.prototype.transparentCorners = false;
    const f: any = fabric.Image.filters;
    const obj: any = canvas.getActiveObject();
    filters.forEach((item, index) => {
      switch (item.type) {
        case "brightness":
          obj.filters[index] = new f.Brightness({
            brightness: item.value,
          });
          break;
        case "contrast":
          obj.filters[index] = new f.Contrast({
            contrast: item.value,
          });
          break;
        case "hue":
          obj.filters[index] = new f.HueRotation({
            rotation: item.value,
          });
          break;
        case "vibrance":
          obj.filters[index] = new f.Vibrance({
            vibrance: item.value,
          });
          break;
        case "noise":
          obj.filters[index] = new f.Noise({
            noise: item.value,
          });
          break;
        case "blur":
          obj.filters[index] = new f.Blur({
            blur: item.value,
          });
          break;
      }
      obj.applyFilters();
      canvas.renderAll();
    });
  }, [filters]);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    const colorArr = [
      "#f40",
      "green",
      "pink",
      "yellow",
      "blue",
      "#fb0000",
      "#17df27",
      "#0fdbd2",
      "#d421d6",
      "#b9eb21",
    ];
    let graph: any = null;
    let isDown = false;
    let originX = 0;
    let originY = 0;
    let radius = 10;
    // 折线使用
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let count = 0;
    if (activeKey === "4") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#000000";
      canvas.freeDrawingBrush.width = 4;
      return;
    } else if (activeKey === "6") {
      fabric.Image.fromURL(
        assetImg,
        img => {
          img.set({
            width: 800,
            height: 1232,
            scaleX: 0.3,
            scaleY: 0.2,
          });
          canvas.add(img);
        },
        {}
      );
      return;
    } else if (activeKey === "7") {
      canvas.clear();
      return;
    } else if (activeKey === "8") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#fff";
      canvas.freeDrawingBrush.width = 10;
      return;
    } else if (activeKey === "9") {
      if (!canvas.getActiveObject()) {
        return;
      }
      if (canvas.getActiveObject().type !== "activeSelection") {
        return;
      }
      const activeObject: any = canvas.getActiveObject();
      activeObject.toGroup();
      canvas.requestRenderAll();
      return;
    } else if (activeKey === "10") {
      if (!canvas.getActiveObject()) {
        return;
      }
      if (canvas.getActiveObject().type !== "group") {
        return;
      }
      const activeObject: any = canvas.getActiveObject();
      activeObject.toActiveSelection();
      canvas.requestRenderAll();
      return;
    } else if (activeKey === "11") {
      canvas.remove(graph);
      return;
    } else if (activeKey === "12") {
      return;
    }
    canvas.isDrawingMode = false;
    canvas.on("mouse:down", function (o) {
      if (canvas.getActiveObject()) {
        isDown = false;
        return;
      }
      const pointer = canvas.getPointer(o.e);
      const fillColor = colorArr[Math.floor(Math.random() * colorArr.length)];
      canvas.selection = true;
      switch (activeKey) {
        case "0":
          graph = new fabric.Rect({
            left: originX,
            top: originY,
            fill: fillColor,
          });
          break;
        case "1":
          graph = new fabric.Circle({
            left: originX,
            top: originY,
            fill: fillColor,
            radius: radius,
          });
          break;
        case "2":
          graph = new fabric.Line();
          canvas.selection = false;
          break;
        case "3":
          graph = new fabric.Line();
          canvas.selection = false;
          if (count === 0) {
            startX = pointer.x;
            startY = pointer.y;
          } else {
            endX = pointer.x;
            endY = pointer.y;
          }
          break;
        case "5":
          graph = new fabric.IText("默认文案", { editable: true });
          break;
      }

      isDown = true;
      originX = pointer.x;
      originY = pointer.y;

      radius = 10;
      graph.set({ top: originY, left: originX });
    });

    canvas.on("mouse:move", function (o) {
      if (!isDown) return;
      const pointer = canvas.getPointer(o.e);
      if (originX > pointer.x) {
        graph.set({ left: Math.abs(pointer.x) });
      }
      if (originY > pointer.y) {
        graph.set({ top: Math.abs(pointer.y) });
      }
      switch (activeKey) {
        case "0":
          graph.set({ width: Math.abs(originX - pointer.x) });
          graph.set({ height: Math.abs(originY - pointer.y) });
          break;
        case "1":
          const radius =
            Math.min(
              Math.abs(originX - pointer.x),
              Math.abs(originY - pointer.y)
            ) / 2;
          graph.set({ radius });
          break;
        case "2":
          const fillColor =
            colorArr[Math.floor(Math.random() * colorArr.length)];
          graph = new fabric.Line([originX, originY, pointer.x, pointer.y], {
            fill: fillColor,
            stroke: fillColor,
            selectable: false,
          });
          break;
      }
      canvas.renderAll();
    });

    canvas.on("mouse:up", function (o) {
      if (activeKey === "3") {
        const pointer = canvas.getPointer(o.e);
        const fillColor = colorArr[Math.floor(Math.random() * colorArr.length)];
        graph = new fabric.Line([startX, startY, endX, endY], {
          fill: fillColor,
          stroke: fillColor,
          selectable: false,
        });

        canvas.renderAll();
        startX = pointer.x;
        startY = pointer.y;
        count++;
        isDown = false;
        if (count > 1) {
          canvas.add(graph);
        }
      } else {
        // canvas.selection = false;
        // graph.set("selectable", false);
        isDown = false;
        canvas.add(graph);
      }
    });
  }, [canvas, activeKey]);

  return (
    <div className={styles.canvas_box}>
      <canvas
        className={styles.canvas_dom}
        id="canvas"
        width="800"
        height="600"
      ></canvas>
    </div>
  );
}

export default CanvasContent;
