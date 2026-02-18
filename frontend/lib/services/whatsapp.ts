import { CartItem } from '../cart-context';

interface OrderDetails {
  customerName: string;
  items: CartItem[];
  total: number;
  discount?: number;
  shippingCost?: number;
  shippingAddress: string;
  paymentMethod: string;
  orderId?: string; // Optional, if we have a generated ID
}

export const WhatsAppService = {
  /**
   * Formats the WhatsApp message to match the user's specific template.
   */
  generateMessage: (details: OrderDetails, storeName: string = "Serenivida"): string => {
    // 1. Format Products List
    // Example: "2 Medias De Compresión BLANCO S/M y 1 Medias De Compresión BLANCO L/XL"
    const productSummary = details.items
      .map(item => {
        // Assuming item.name already contains the full product name including variant if applicable
        // or we use what's available in the CartItem interface
        return `${item.quantity} ${item.name}`;
      })
      .join(' y ');

    // 2. Build the Message
    // Using simple newlines for WhatsApp compatibility
    return `Hola, ${details.customerName}

Queremos confirmar los detalles de tu pedido y la dirección en donde sera entregado:
✔ Producto: ${productSummary}
✔ Valor: $${details.total.toFixed(2)}
📍 Dirección: ${details.shippingAddress}

Pago: ${details.paymentMethod}

Si toda la información es correcta, pulsa en Confirmar Pedido para continuar con el envío 👇`;
  },

  /**
   * Generates the WhatsApp Click-to-Chat URL.
   * Uses the Universal Link format which works best on both Mobile and Web.
   */
  generateUrl: (phoneNumber: string, message: string): string => {
    // Remove non-numeric characters from phone number to ensure it works
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    
    // Using the official WhatsApp Universal Link
    // https://wa.me/<number>?text=<message>
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  },

  /**
   * Redirects the user to WhatsApp.
   */
  redirectToWhatsApp: (phoneNumber: string, message: string): void => {
    const url = WhatsAppService.generateUrl(phoneNumber, message);
    window.open(url, '_blank');
  }
};
