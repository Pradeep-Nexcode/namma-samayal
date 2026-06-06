interface CardProps {
  title: string;
  value: string | number;
}

const Card = ({ title, value }: CardProps) => {
  return (
    <div className="border bg-white p-4 rounded">
      <h2 className="text-sm text-gray-500">{title}</h2>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

export default Card;
