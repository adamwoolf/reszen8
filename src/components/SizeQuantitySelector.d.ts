type SizeQuantity = {
    size: string;
    quantity: number;
};
type SizeQuantitySelectorProps = {
    sizes: string[];
    selectedSizes: SizeQuantity[];
    onSizeQuantityChange: (sizes: SizeQuantity[]) => void;
    className?: string;
};
declare const SizeQuantitySelector: ({ sizes, selectedSizes, onSizeQuantityChange, className, }: SizeQuantitySelectorProps) => import("react/jsx-runtime").JSX.Element;
export default SizeQuantitySelector;
