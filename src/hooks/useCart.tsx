import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
	children: ReactNode;
}

interface UpdateProductAmount {
	productId: number;
	amount: number;
}

interface CartContextData {
	cart: Product[];
	addProduct: (productId: number) => Promise<void>;
	removeProduct: (productId: number) => void;
	updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
	const [cart, setCart] = useState<Product[]>(() => {
		const storagedCart = localStorage.getItem("@RocketShoes:cart");

		if (storagedCart) {
			return JSON.parse(storagedCart);
		}

		return [];
	});

	const addProduct = async (productId: number) => {
		try {
			const updatedCart = [...cart];
			const productAlreadyInCart = updatedCart.find(
				(product) => product.id === productId
			);
			const stockOfRequestedProduct: Stock = await api
				.get(`/stock/${productId}`)
				.then((response) => response.data);

			const requestedAmount = productAlreadyInCart
				? productAlreadyInCart.amount + 1
				: 1;

			if (requestedAmount > stockOfRequestedProduct.amount) {
				toast.error("Quantidade solicitada fora de estoque");
				return;
			}

			if (productAlreadyInCart) {
				productAlreadyInCart.amount++;
			} else {
				const product = await api
					.get(`/products/${productId}`)
					.then((response) => response.data);

				updatedCart.push({ ...product, amount: 1 });
			}

			setCart(updatedCart);
			localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
		} catch {
			toast.error("Erro na adição do produto");
		}
	};

	const removeProduct = (productId: number) => {
		try {
			const updatedCart = [...cart];
			const indexOfProductToDelete = updatedCart.findIndex(
				(product) => product.id === productId
			);

			if (indexOfProductToDelete >= 0) {
				updatedCart.splice(indexOfProductToDelete, 1);
				setCart(updatedCart);
				localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
			} else {
				throw Error();
			}
		} catch {
			toast.error("Erro na remoção do produto");
		}
	};

	const updateProductAmount = async ({
		productId,
		amount,
	}: UpdateProductAmount) => {
		try {
			const updatedCart = [...cart];

			if (amount <= 0) {
				return toast.error("Erro na alteração de quantidade do produto");
			}

			const stockOfRequestedProduct: Stock = await api
				.get(`/stock/${productId}`)
				.then((response) => response.data);

			const productToUpdate = updatedCart.find((item) => item.id === productId);

			console.log({ productToUpdate, stockOfRequestedProduct });

			if (amount <= stockOfRequestedProduct.amount) {
				if (productToUpdate) {
					productToUpdate.amount = amount;
				}
			} else {
				return toast.error("Quantidade solicitada fora de estoque");
			}
			setCart(updatedCart);
			localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
		} catch {
			toast.error("Erro na alteração de quantidade do produto");
		}
	};

	useEffect(() => {
		console.log(cart);
	}, [cart]);

	return (
		<CartContext.Provider
			value={{ cart, addProduct, removeProduct, updateProductAmount }}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart(): CartContextData {
	const context = useContext(CartContext);

	return context;
}
