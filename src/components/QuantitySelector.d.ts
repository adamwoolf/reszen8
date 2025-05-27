interface QuantitySelectorProps {
    initialQuantity?: number;
    min?: number;
    max?: number;
    onQuantityChange: (quantity: number) => void;
    className?: string;
}
declare const QuantitySelector: ({ initialQuantity, min, max, onQuantityChange, className, }: QuantitySelectorProps) => import("react/jsx-runtime").JSX.Element;
export default QuantitySelector;
