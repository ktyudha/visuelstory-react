import { FunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';

type IconProps = {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
};

const Icon: FunctionComponent<IconProps> = ({
  name,
  size = 15,
  color = 'currentColor',
  className = '',
}) => {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    import(`@/assets/icons/${name}.svg`).then((module) => {
      setIcon(() => module.default);
    });
  }, [name]);

  if (!icon) return <div>...</div>;

  return (
    <div className={clsx([`flex items-center justify-center`, className])}>
      <img
        src={icon!}
        alt="Icon"
        style={{ width: size, height: size, color }}
      />
    </div>
  );
};

export default Icon;
