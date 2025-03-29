import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Link } from "wouter";
import ProductCard from "@/components/shop/ProductCard";

export default function ShopSection() {
  // Fetch featured products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: false, // Disabled for demo, would be enabled in a real app
  });
  
  // Sample data for demo
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
    }
  ];
  
  const displayedProducts = products || sampleProducts;
  
  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Gym Shop</h2>
            <div className="flex items-center">
              <span className="bg-amber-100 text-amber-800 py-1 px-3 rounded-full text-xs font-medium flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                245 Points Available
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/shop">
              <a className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all products
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
