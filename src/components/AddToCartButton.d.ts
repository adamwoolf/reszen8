/// <reference types="react" />
type SizeQuantity = {
    size: string;
    quantity: number;
};
type Product = {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    sizes?: string[];
};
type AddToCartButtonProps = {
    product: Product;
    className?: string;
    selectedSizes: SizeQuantity[];
    disabled?: boolean;
    onSizeRequired?: () => void;
    children?: React.ReactNode;
};
declare const AddToCartButton: ({ product, className, selectedSizes, disabled, onSizeRequired, children }: AddToCartButtonProps) => import("react/jsx-runtime").JSX.Element;
export default AddToCartButton;
