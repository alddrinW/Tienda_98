"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useCompare } from "@/lib/compare-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Star,
  Heart,
  Shuffle,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Check,
  Share2,
  ThumbsUp,
  MessageSquare,
  MapPin,
  ChevronDown,
  ChevronUp,
  CreditCard,
  User
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Types
interface Product {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_principal: string;
  stock: number;
  calificacion_promedio: number;
  cantidad_resenias: number;
  Store?: { nombre: string }; // Assuming backend join
  Categoria?: { nombre: string, slug: string };
}

interface Review {
  idResenia: number;
  calificacion: number;
  titulo: string;
  comentario: string;
  fecha: string;
  nombre_invitado?: string;
  Usuario?: { nombre: string, apellido: string };
  verificada_compra: boolean;
}

export default function ProductPage() {
  const routeParams = useParams()
  const productId = routeParams.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const { toggleItem: toggleCompare, isInCompare } = useCompare()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showAllSpecs, setShowAllSpecs] = useState(false)
  const [shared, setShared] = useState(false)

  // Review State
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '', name: '', email: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // 1. Fetch Product
        const prodRes = await fetch(`http://localhost:5000/api/products/id/${productId}`)
        if (!prodRes.ok) throw new Error('Product not found')
        const prodData = await prodRes.json()
        setProduct(prodData)

        // 2. Fetch Reviews
        const revRes = await fetch(`http://localhost:5000/api/reviews/producto/${productId}`)
        if (revRes.ok) {
            const revData = await revRes.json()
            setReviews(revData)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) fetchData()
  }, [productId])


  const handleAddToCart = () => {
    if (!product) return;
    const cartItem = {
        id: product.idProducto,
        name: product.nombre,
        price: Number(product.precio),
        image: product.imagen_principal,
        store: "Tienda98", // Placeholder if not in backend
    }

    for (let i = 0; i < quantity; i++) {
      addItem(cartItem)
    }
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
      router.push("/carrito")
    }, 800)
  }

  const handleBuyNow = () => {
    handleAddToCart() // Add and then redirect
    // router.push("/checkout") // Logic inside handleAddToCart handles redirect but maybe slightly different for 'Buy Now'
  }

  const submitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsReviewSubmitting(true);
      try {
          // Check if guest (no token)
          const token = localStorage.getItem('token');
          const headers: any = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const body: any = {
              idProducto: productId,
              calificacion: newReview.rating,
              titulo: newReview.title,
              comentario: newReview.comment
          };

          if (!token) {
              body.nombre_invitado = newReview.name || "Invitado";
              body.email_invitado = newReview.email; // Optional
          }

          const res = await fetch('http://localhost:5000/api/reviews', {
              method: 'POST',
              headers,
              body: JSON.stringify(body)
          });

          if (res.ok) {
              const savedReview = await res.json();
              setReviews([savedReview, ...reviews]); // Prepend logic might be slightly different depending on backend response format
              alert('Review submitted!')
              setNewReview({ rating: 5, title: '', comment: '', name: '', email: '' })
              setShowReviewForm(false)
              // Ideally re-fetch to get populated fields
              const revRes = await fetch(`http://localhost:5000/api/reviews/producto/${productId}`)
              if(revRes.ok) setReviews(await revRes.json())

          } else {
              const err = await res.json();
              alert(err.message || 'Error submitting review');
          }

      } catch (err) {
          console.error(err);
          alert('Failed to submit review');
      } finally {
          setIsReviewSubmitting(false);
      }
  }


  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Producto no encontrado</h1>
            <Link href="/productos">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white mt-4">Ver productos</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const priceDollars = Math.floor(product.precio)
  const priceCents = Math.round((product.precio - priceDollars) * 100).toString().padStart(2, "0")
  const images = [product.imagen_principal] // Currently backend only has 1 image

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 md:px-6 lg:px-12 py-3">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
              <Link href="/" className="hover:text-orange-500 transition-colors">Inicio</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/productos" className="hover:text-orange-500 transition-colors">Productos</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium truncate max-w-[200px]">{product.nombre}</span>
            </nav>
          </div>
        </div>

        {/* Product Main Section */}
        <section className="container mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* LEFT COLUMN - Image */}
            <div className="lg:w-[38%] flex-shrink-0">
                  <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={images[selectedImage] || "/placeholder.svg"}
                      alt={product.nombre}
                      className="w-full h-full object-contain p-6"
                    />
                  </div>
            </div>

            {/* MIDDLE COLUMN - Info */}
            <div className="lg:flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-medium text-foreground leading-snug">{product.nombre}</h1>
              
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={`star-${i}`}
                      className={`w-4 h-4 ${i <= Math.floor(product.calificacion_promedio || 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-orange-500">({product.cantidad_resenias || 0})</span>
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-foreground">US$</span>
                  <span className="text-3xl font-bold text-foreground tracking-tight">{priceDollars}</span>
                  <sup className="text-sm font-bold text-foreground">{priceCents}</sup>
                </div>
                <p className="text-xs text-gray-500 mt-1">IVA incluido.</p>
              </div>

              <hr className="my-4 border-gray-200" />
              
              <div className="text-sm text-gray-700">
                  <p>{product.descripcion}</p>
              </div>

            </div>

            {/* RIGHT COLUMN - Buy Box */}
            <div className="lg:w-[280px] xl:w-[300px] flex-shrink-0">
              <div className="lg:sticky lg:top-24 border border-gray-200 rounded-xl p-5 space-y-4 bg-white">
                <div className="flex items-baseline gap-1">
                    <span className="text-sm text-foreground">US$</span>
                    <span className="text-2xl font-bold text-foreground tracking-tight">{priceDollars}</span>
                    <sup className="text-xs font-bold text-foreground">{priceCents}</sup>
                </div>

                <div className="space-y-2 text-sm">
                   <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">Entrega estimada</p>
                      <p className="text-xs text-gray-500">3-5 días hábiles</p>
                    </div>
                  </div>
                </div>

                <p className="text-lg font-semibold text-green-600">Disponible ({product.stock})</p>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">Cantidad:</span>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleAddToCart} disabled={addedToCart} className="w-full h-10 rounded-full bg-amber-400 hover:bg-amber-500 text-foreground">
                  {addedToCart ? "Agregado" : "Agregar al carrito"}
                </Button>
                <Button onClick={handleBuyNow} className="w-full h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                  Comprar ahora
                </Button>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                    <button onClick={() => toggleItem({ id: product.idProducto, name: product.nombre, price: Number(product.precio), image: product.imagen_principal })} className={`flex items-center gap-2 text-sm w-full ${isInWishlist(product.idProducto) ? "text-orange-600" : "text-orange-500 hover:text-orange-600"}`}>
                        <Heart className={`w-4 h-4 ${isInWishlist(product.idProducto) ? "fill-current" : ""}`} />
                        {isInWishlist(product.idProducto) ? "En tu lista" : "Agregar a lista"}
                    </button>
                    <button onClick={handleBuyNow /* Placeholder share */} className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 w-full">
                        <Share2 className="w-4 h-4" /> Compartir
                    </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Reviews Section */}
        <section className="container mx-auto px-4 md:px-6 lg:px-12 py-8 md:py-10">
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Opiniones de clientes</h2>
                <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                    {showReviewForm ? 'Cancelar Reseña' : 'Escribir una Reseña'}
                </Button>
            </div>

            {showReviewForm && (
                <Card className="mb-8 bg-gray-50">
                    <CardContent className="p-6">
                        <form onSubmit={submitReview} className="space-y-4">
                            <h3 className="font-semibold text-lg">Escribe tu opinión</h3>
                            
                            {/* Rating */}
                            <div>
                                <Label>Tu Calificación</Label>
                                <div className="flex gap-1 mt-1">
                                    {[1,2,3,4,5].map(star => (
                                        <button key={star} type="button" onClick={() => setNewReview({...newReview, rating: star})}>
                                            <Star className={`w-6 h-6 ${star <= newReview.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Guest Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre (Para invitados)</Label>
                                    <Input 
                                        placeholder="Tu nombre" 
                                        value={newReview.name} 
                                        onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Email (Opcional)</Label>
                                    <Input 
                                        placeholder="tu@email.com" 
                                        value={newReview.email} 
                                        onChange={(e) => setNewReview({...newReview, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Título</Label>
                                <Input 
                                    required
                                    placeholder="Resumen corto"
                                    value={newReview.title}
                                    onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <Label>Comentario</Label>
                                <Textarea 
                                    required
                                    placeholder="Cuéntanos más sobre tu experiencia..."
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                />
                            </div>

                            <Button type="submit" disabled={isReviewSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white">
                                {isReviewSubmitting ? "Enviando..." : "Publicar Reseña"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                  <p className="text-gray-500">No hay reseñas aún. ¡Sé el primero en opinar!</p>
              ) : (
                  reviews.map((review, idx) => (
                    <div key={`review-${idx}`} className="space-y-2 pb-6 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500"/>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                            {review.Usuario ? `${review.Usuario.nombre} ${review.Usuario.apellido}` : (review.nombre_invitado || "Invitado")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={`rev-star-${idx}-${i}`}
                              className={`w-3.5 h-3.5 ${i <= review.calificacion ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                            />
                          ))}
                        </div>
                        {review.verificada_compra && (
                            <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                                <Check className="w-3 h-3"/> Compra verificada
                            </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm">{review.titulo}</h4>
                      <p className="text-xs text-gray-500">{new Date(review.fecha).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comentario}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
