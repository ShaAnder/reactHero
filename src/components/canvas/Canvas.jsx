import useCanvas from "../../hooks/useCanvas";

const Canvas = (props) => {
  const { draw, ...rest } = props;
  const ref = useCanvas(draw);

  return <canvas ref={ref} {...rest} />;
};

export default Canvas;
