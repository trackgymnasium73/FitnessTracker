import { useState } from "react";
import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";

interface ProductCardProps {
  product: Product;
  userPoints: number;
  onAddToCart: (productId: number, usePoints: boolean) => void;
}

export default function ProductCard({ product, userPoints, onAddToCart }: ProductCardProps) {
  const [usePoints, setUsePoints] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Calculate discounted price
  const discountedPrice = product.discountPercentage > 0 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;

  // Calculate points discounted price
  const pointsDiscountedPrice = usePoints && product.pointsRedemptionDiscount > 0
    ? discountedPrice * (1 - product.pointsRedemptionDiscount / 100)
    : discountedPrice;

  // Check if user has enough points
  const hasEnoughPoints = userPoints >= product.pointsToRedeem;

  // Handle add to cart
  const handleAddToCart = () => {
    onAddToCart(product.id, usePoints);
  };

  return (
    <Card className="border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-48 w-full object-cover cursor-pointer"
          onClick={() => setDetailsOpen(true)}
        />
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discountPercentage}% OFF
          </div>
        )}
        {product.isBestseller && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            BESTSELLER
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 
          className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
          onClick={() => setDetailsOpen(true)}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 flex-grow">{product.description}</p>
        <div className="mt-2 flex items-center">
          <div className="font-bold text-lg text-gray-900">${pointsDiscountedPrice.toFixed(2)}</div>
          {product.discountPercentage > 0 && (
            <div className="ml-2 text-xs line-through text-gray-500">${product.price.toFixed(2)}</div>
          )}
        </div>
        {product.pointsToRedeem > 0 && (
          <div className="mt-1 flex items-center">
            <Toggle 
              className="h-5 px-2 text-xs text-amber-600 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-800"
              pressed={usePoints}
              onPressedChange={setUsePoints}
              disabled={!hasEnoughPoints}
            >
              <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Use {product.pointsToRedeem} points for {product.pointsRedemptionDiscount}% off
            </Toggle>
          </div>
        )}
        <Button 
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </CardContent>

      {/* Product Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="rounded-md w-full h-56 object-cover"
              />
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">{product.description}</p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Regular Price:</span>
                  <span className="font-medium">${product.price.toFixed(2)}</span>
                </div>
                
                {product.discountPercentage > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Discount:</span>
                    <span className="font-medium text-blue-600">{product.discountPercentage}% OFF</span>
                  </div>
                )}
                
                {product.pointsToRedeem > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Points Option:</span>
                    <span className="font-medium text-amber-600">
                      {product.pointsToRedeem} points for {product.pointsRedemptionDiscount}% off
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-bold mt-4">
                  <span>Final Price:</span>
                  <span>${discountedPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {product.pointsToRedeem > 0 && (
                  <Toggle 
                    className="h-8 text-sm text-amber-600 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-800 border border-amber-200"
                    pressed={usePoints}
                    onPressedChange={setUsePoints}
                    disabled={!hasEnoughPoints}
                  >
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Use Points
                  </Toggle>
                )}
                <Button 
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  onClick={() => {
                    handleAddToCart();
                    setDetailsOpen(false);
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
