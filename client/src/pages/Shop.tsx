import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Cart } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/shop/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartItemWithProduct extends Cart {
  product?: Product;
}

export default function Shop() {
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [cartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();

  // In a real app, this userId would come from auth context
  const userId = 1;
  const userPoints = 245; // Would come from user state in a real app

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: category !== "all" ? category : undefined }],
    enabled: false, // Disabled for demo, would be enabled in a real app
  });

  // Fetch cart items
  const { data: cartItems, isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: [`/api/cart/${userId}`],
    enabled: false, // Disabled for demo, would be enabled in a real app
  });

  // Sample products data for demo
  const sampleProducts: Product[] = [
    {
      id: 1,
      name: "Premium Whey Protein",
      description: "High-quality protein powder, 25g protein per serving",
      price: 39.99,
      discountPercentage: 10,
      pointsToRedeem: 100,
      pointsRedemptionDiscount: 5,
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
      category: "protein",
      isBestseller: false
    },
    {
      id: 2,
      name: "BCAA Supplement",
      description: "Branched-chain amino acids for muscle recovery",
      price: 24.99,
      discountPercentage: 0,
      pointsToRedeem: 50,
      pointsRedemptionDiscount: 5,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      category: "supplements",
      isBestseller: false
    },
    {
      id: 3,
      name: "Premium Shaker Bottle",
      description: "BPA-free shaker bottle with mixing ball",
      price: 14.99,
      discountPercentage: 0,
      pointsToRedeem: 30,
      pointsRedemptionDiscount: 5,
      imageUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba",
      category: "equipment",
      isBestseller: true
    },
    {
      id: 4,
      name: "Resistance Bands Set",
      description: "Set of 5 resistance bands for home workouts",
      price: 19.99,
      discountPercentage: 0,
      pointsToRedeem: 40,
      pointsRedemptionDiscount: 5,
      imageUrl: "https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93",
      category: "equipment",
      isBestseller: false
    },
    {
      id: 5,
      name: "Creatine Monohydrate",
      description: "Pure creatine for strength and power",
      price: 29.99,
      discountPercentage: 15,
      pointsToRedeem: 60,
      pointsRedemptionDiscount: 5,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      category: "supplements",
      isBestseller: true
    },
    {
      id: 6,
      name: "Adjustable Dumbbell Set",
      description: "Space-saving adjustable dumbbells for home gym",
      price: 149.99,
      discountPercentage: 0,
      pointsToRedeem: 200,
      pointsRedemptionDiscount: 10,
      imageUrl: "https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93",
      category: "equipment",
      isBestseller: false
    },
    {
      id: 7,
      name: "Compression Sleeve",
      description: "Elbow support for lifting and recovery",
      price: 19.99,
      discountPercentage: 0,
      pointsToRedeem: 40,
      pointsRedemptionDiscount: 5,
      imageUrl: "https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93",
      category: "accessories",
      isBestseller: false
    },
    {
      id: 8,
      name: "Pre-Workout Formula",
      description: "Energy boost for intense workouts",
      price: 34.99,
      discountPercentage: 5,
      pointsToRedeem: 70,
      pointsRedemptionDiscount: 5,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      category: "supplements",
      isBestseller: false
    }
  ];

  // Sample cart items for demo
  const sampleCartItems: CartItemWithProduct[] = [
    {
      id: 1,
      userId: 1,
      productId: 1,
      quantity: 1,
      usePoints: false,
      product: sampleProducts[0]
    },
    {
      id: 2,
      userId: 1,
      productId: 3,
      quantity: 2,
      usePoints: true,
      product: sampleProducts[2]
    }
  ];

  const displayedProducts = products || sampleProducts;
  const displayedCartItems = cartItems || sampleCartItems;

  // Filter products based on category and search query
  const filteredProducts = displayedProducts.filter(product => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesSearch = !searchQuery || 
                          product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "priceAsc") return a.price - b.price;
    if (sortBy === "priceDesc") return b.price - a.price;
    if (sortBy === "discount") return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    // Default: featured (bestsellers first)
    return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
  });

  // Calculate cart total
  const cartTotal = displayedCartItems.reduce((total, item) => {
    if (!item.product) return total;
    
    let itemPrice = item.product.price;
    
    // Apply product discount
    if (item.product.discountPercentage > 0) {
      itemPrice -= (itemPrice * item.product.discountPercentage / 100);
    }
    
    // Apply points discount if using points
    if (item.usePoints && item.product.pointsRedemptionDiscount > 0) {
      itemPrice -= (itemPrice * item.product.pointsRedemptionDiscount / 100);
    }
    
    return total + (itemPrice * item.quantity);
  }, 0);

  // Calculate points used
  const pointsUsed = displayedCartItems.reduce((total, item) => {
    if (item.usePoints && item.product) {
      return total + (item.product.pointsToRedeem * item.quantity);
    }
    return total;
  }, 0);

  // Handle add to cart
  const handleAddToCart = async (productId: number, usePoints: boolean) => {
    try {
      const cartData = {
        userId,
        productId,
        quantity: 1,
        usePoints
      };
      
      await apiRequest("POST", "/api/cart", cartData);
      
      await queryClient.invalidateQueries({ queryKey: [`/api/cart/${userId}`] });
      
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle remove from cart
  const handleRemoveFromCart = async (cartId: number) => {
    try {
      await apiRequest("DELETE", `/api/cart/${cartId}`, undefined);
      
      await queryClient.invalidateQueries({ queryKey: [`/api/cart/${userId}`] });
      
      toast({
        title: "Removed from cart",
        description: "Product has been removed from your cart",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove product from cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle update cart item quantity
  const handleUpdateQuantity = async (cartId: number, quantity: number, usePoints: boolean) => {
    try {
      await apiRequest("PUT", `/api/cart/${cartId}`, { quantity, usePoints });
      
      await queryClient.invalidateQueries({ queryKey: [`/api/cart/${userId}`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym Shop</h1>
          <p className="text-sm text-gray-500">Buy supplements, equipment, and more with exclusive discounts</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <span className="bg-amber-100 text-amber-800 py-1 px-3 rounded-full text-xs font-medium flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {userPoints} Points Available
          </span>
          <button 
            className="ml-4 relative p-2 text-gray-400 hover:text-gray-500"
            onClick={() => setCartOpen(true)}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {displayedCartItems.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full">
                {displayedCartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="md:w-1/2">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="supplements">Supplements</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                  <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                  <SelectItem value="discount">Biggest Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product filters and badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {category !== "all" && (
              <Badge 
                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                onClick={() => setCategory("all")}
              >
                {category} <span className="ml-1">×</span>
              </Badge>
            )}
            {searchQuery && (
              <Badge 
                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                onClick={() => setSearchQuery("")}
              >
                "{searchQuery}" <span className="ml-1">×</span>
              </Badge>
            )}
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
              <Button onClick={() => { setCategory("all"); setSearchQuery(""); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  userPoints={userPoints}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Free Shipping</CardTitle>
            <CardDescription>On orders over $50</CardDescription>
          </CardHeader>
          <CardContent>
            <svg className="h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Points Program</CardTitle>
            <CardDescription>Earn points with every purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <svg className="h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quality Guarantee</CardTitle>
            <CardDescription>100% satisfaction or your money back</CardDescription>
          </CardHeader>
          <CardContent>
            <svg className="h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* Shopping Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Shopping Cart</DialogTitle>
          </DialogHeader>
          
          {cartLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : displayedCartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Button onClick={() => setCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                {displayedCartItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      {item.product?.imageUrl && (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                          <button 
                            className="text-gray-400 hover:text-red-500" 
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex items-center mt-2">
                          <p className="text-sm text-gray-700">
                            ${((item.product?.price || 0) * (1 - (item.product?.discountPercentage || 0) / 100)).toFixed(2)}
                            {item.product?.discountPercentage ? (
                              <span className="ml-2 text-xs line-through text-gray-500">${item.product.price.toFixed(2)}</span>
                            ) : null}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center"
                              onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1), item.usePoints)}
                              disabled={item.quantity <= 1}
                            >
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="text-sm">{item.quantity}</span>
                            <button 
                              className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.usePoints)}
                            >
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          
                          {item.product?.pointsToRedeem && item.product.pointsToRedeem > 0 && (
                            <div className="flex items-center">
                              <input 
                                type="checkbox" 
                                id={`use-points-${item.id}`}
                                checked={item.usePoints}
                                onChange={() => handleUpdateQuantity(item.id, item.quantity, !item.usePoints)}
                                className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4 mr-1"
                              />
                              <label htmlFor={`use-points-${item.id}`} className="text-xs text-amber-600">
                                Use {item.product.pointsToRedeem * item.quantity} points (-{item.product.pointsRedemptionDiscount}%)
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                {pointsUsed > 0 && (
                  <div className="flex justify-between text-xs text-amber-600">
                    <span>Points used</span>
                    <span>{pointsUsed} points</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <DialogFooter>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Proceed to Checkout
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
