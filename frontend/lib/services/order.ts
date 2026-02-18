// This service will interact with the backend to create an actual Order record
// before redirecting the user to WhatsApp.

interface CreateOrderDTO {
  userInfo: {
    nombre: string;
    email: string;
    telefono: string;
  };
  shippingInfo: {
    direccion: string;
    ciudad: string;
    referencia?: string;
  };
  cartItems: {
    productId: number;
    variantId?: number;
    quantity: number;
  }[];
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  paymentMethod: string;
}

export const OrderService = {
  createOrder: async (orderData: CreateOrderDTO) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // If we had a token, but this is Guest/Optional
        },
        body: JSON.stringify({
          userInfo: orderData.userInfo,
          shippingInfo: orderData.shippingInfo,
          cartItems: orderData.cartItems,
          paymentMethod: orderData.paymentMethod,
          total: orderData.totals.total,
          shippingCost: orderData.totals.shipping
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating order');
      }

      const data = await response.json();
      
      return {
        success: true,
        orderId: data.orderId,
        message: "Order created successfully"
      };
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }
};
