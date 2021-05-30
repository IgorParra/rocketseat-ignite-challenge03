import React from "react";
import {
	MdDelete,
	MdAddCircleOutline,
	MdRemoveCircleOutline,
} from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
	id: number;
	title: string;
	price: number;
	image: string;
	amount: number;
}

const Cart = (): JSX.Element => {
	const { cart, removeProduct, updateProductAmount } = useCart();

	const cartFormatted = cart.map((product, key) => {
		const { amount, image, price, title } = product;
		return (
			<tr key={key} data-testid="product">
				<td>
					<img src={image} alt={title} />
				</td>
				<td>
					<strong>{title}</strong>
					<span>{formatPrice(price)}</span>
				</td>
				<td>
					<div>
						<button
							type="button"
							data-testid="decrement-product"
							disabled={amount <= 1}
							onClick={() => handleProductDecrement(product)}
						>
							<MdRemoveCircleOutline size={20} />
						</button>
						<input
							type="text"
							data-testid="product-amount"
							readOnly
							style={{ textAlign: "center" }}
							value={amount}
						/>
						<button
							type="button"
							data-testid="increment-product"
							onClick={() => handleProductIncrement(product)}
						>
							<MdAddCircleOutline size={20} />
						</button>
					</div>
				</td>
				<td>
					<strong>{formatPrice(price)}</strong>
				</td>
				<td>
					<button
						type="button"
						data-testid="remove-product"
						onClick={() => handleRemoveProduct(product.id)}
					>
						<MdDelete size={20} />
					</button>
				</td>
			</tr>
		);
	});
	const total = formatPrice(
		cart.reduce((sumTotal, product) => {
			return (sumTotal += product.price * product.amount);
		}, 0)
	);

	function handleProductIncrement(product: Product) {
		const { id, amount } = product;
		updateProductAmount({ productId: id, amount: amount + 1 });
	}

	function handleProductDecrement(product: Product) {
		const { id, amount } = product;
		updateProductAmount({ productId: id, amount: amount - 1 });
	}

	function handleRemoveProduct(productId: number) {
		removeProduct(productId);
	}

	return (
		<Container>
			<ProductTable>
				<thead>
					<tr>
						<th aria-label="product image" />
						<th>PRODUTO</th>
						<th>QTD</th>
						<th>SUBTOTAL</th>
						<th aria-label="delete icon" />
					</tr>
				</thead>
				<tbody>{cartFormatted}</tbody>
			</ProductTable>

			<footer>
				<button type="button">Finalizar pedido</button>

				<Total>
					<span>TOTAL</span>
					<strong>{total}</strong>
				</Total>
			</footer>
		</Container>
	);
};

export default Cart;
