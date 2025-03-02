import { useState } from 'react';
import DropdownIcon from '@assets/icons/dropdown-custom-icon.svg';
import classNames from 'classnames';

interface CustomDropdownProps {
  label: string;
  name: string;
  options: string[];
  onChange: (value: string) => void;
  value: string;
  placeholder: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  name,
  options,
  onChange,
  value,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative w-full">
      <label className="block text-[12px] font-normal mb-2">{label}</label>

      <div
        className="w-full p-2 border rounded-[12px] flex justify-between items-center cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className={classNames(!value ? 'text-[#A9A9A9]' : 'text-black')}>
          {value || placeholder}
        </span>{' '}
        {}
        <img
          src={DropdownIcon}
          alt="down-arrow"
          className={`w-[20px] h-[20px] transition-transform duration-300 transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
          {options.map((option, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      <input type="hidden" name={name} value={value} />
    </div>
  );
};

export default CustomDropdown;
