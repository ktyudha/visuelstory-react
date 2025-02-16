import { FunctionComponent, useEffect, useState } from "react";
import clsx from "clsx";

type ImageProps = {
  name: string;
  className?: string;
};

const Image: FunctionComponent<ImageProps> = ({ name, className = "" }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    import(`@/assets/images/${name}.png`).then((module) => {
      setImage(() => module.default);
    });
  }, [name]);

  if (!image) return <div>...</div>;

  return (
    <img src={image!} alt={name} loading="lazy" className={clsx([className])} />
  );
};

export default Image;
