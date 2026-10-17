import ProductForm from "../ProductForm";
export const metadata = { title: "Edit product" };
export default function EditProductPage({ params }) { return <ProductForm productId={params.productId} />; }
