type SizeQuantity = {
    size: string;
    quantity: number;
};
type SizeDropdownSelectorProps = {
    sizes: string[];
    selectedSizes: SizeQuantity[];
    onSizeQuantityChange: (sizes: SizeQuantity[]) => void;
    className?: string;
};
declare const SizeDropdownSelector: ({ sizes, selectedSizes, onSizeQuantityChange, className, }: SizeDropdownSelectorProps) => import("react/jsx-runtime").JSX.Element;
export default SizeDropdownSelector;
