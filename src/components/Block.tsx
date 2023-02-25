interface Props {
  className?: string;
  children?: React.ReactNode;
}

const Block: React.FC<Props> = ({ className = "", children }) => {
  return <div className={`absolute ${className}`}>{children}</div>;
};

export default Block;
