type SizeSelectorProps = {
    sizes: string[];
    selectedSizes: string[];
    onSizeSelect: (sizes: string[]) => void;
    className?: string;
};
declare const SizeSelector: ({ sizes, selectedSizes, onSizeSelect, className, }: SizeSelectorProps) => import("react/jsx-runtime").JSX.Element;
export default SizeSelector;
