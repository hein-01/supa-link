import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Compass } from "lucide-react";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import BusinessDirectory from "./BusinessDirectory";
import PopularBusinesses from "@/components/PopularBusinesses";
import Footer from "@/components/Footer";
import MobileNavBar from "@/components/MobileNavBar";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
// Import hero background images with error handling
const heroBg1 = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=350&fit=crop";
const heroBg2 = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=350&fit=crop";
const heroBg3 = "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=1200&h=350&fit=crop";
const heroBgMobile1 = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=350&fit=crop";
const heroBgMobile2 = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=350&fit=crop";
const heroBgMobile3 = "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&h=350&fit=crop";

const Index = () => {
  console.log('Index component is rendering...'); // Debug log
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("product");
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const typingPlaceholder = useTypingEffect("Search by business name, etc", 20);
  const navigate = useNavigate();

  const heroBackgrounds = [heroBg1, heroBg2, heroBg3];
  const heroBackgroundsMobile = [heroBgMobile1, heroBgMobile2, heroBgMobile3];
  
  const categories = [
    { value: "product", label: "Find Product" },
    { value: "service", label: "Find Service" },
    { value: "business", label: "Find Business" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/find-shops?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  console.log('Index component returning JSX...'); // Debug log
  
  return (
    <div className="min-h-screen bg-background pt-16 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Banner Section */}
      <section className="relative h-[300px] md:h-[350px] px-4 overflow-visible mb-12">
        {/* Background Images Slider */}
        <div className="absolute inset-0">
          {/* Desktop Background Images */}
          {heroBackgrounds.map((bg, index) => (
            <div
              key={`desktop-${index}`}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 hidden md:block ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${bg})` }}
            />
          ))}
          {/* Mobile Background Images */}
          {heroBackgroundsMobile.map((bg, index) => (
            <div
              key={`mobile-${index}`}
              className={`absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-1000 block md:hidden ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${bg})` }}
            />
          ))}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container mx-auto text-center relative z-10">
        </div>
        
        {/* Search Bar - positioned extending below hero */}
        <div className="absolute -bottom-8 left-4 right-4 z-20">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-2 flex items-center space-x-2">
            <div className="bg-yellow-400 rounded-md overflow-hidden">
              <Swiper
                direction="vertical"
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                }}
                loop={true}
                className="h-10 w-full"
                modules={[Autoplay]}
              >
                {categories.map((category) => (
                  <SwiperSlide key={category.value} className="h-10 flex items-center">
                     <button
                       onClick={() => setSelectedCategory(category.value)}
                       className={`w-full h-full text-black font-medium text-xs sm:text-sm flex items-center justify-center px-1 sm:px-4 ${
                         selectedCategory === category.value ? 'bg-yellow-500' : 'bg-yellow-400'
                       }`}
                     >
                      {category.label}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            <Input
              type="text"
              placeholder={typingPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              className="flex-1 border-0 text-gray-600 placeholder-gray-400 focus-visible:ring-0 text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
            />
            
            <Button 
              onClick={handleSearchSubmit}
              className="bg-transparent hover:bg-transparent text-muted-foreground px-3 py-2 rounded-md flex items-center justify-center"
            >
              <Search className="h-10 w-10" strokeWidth={3} />
            </Button>
          </div>
        </div>
      </section>


      {/* Find a shop/Start your online shop Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950/30 dark:via-slate-900/50 dark:to-cyan-950/30 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm">
            {/* Decorative background elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Illustration */}
              <div className="flex-shrink-0 animate-scale-in">
                <div className="relative">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-500 hover:scale-105 animate-slow-spin">
                    <div className="w-14 h-14 md:w-18 md:h-18 bg-white/20 rounded-full backdrop-blur-sm">
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                  
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 text-center lg:text-left max-w-2xl">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent mb-4 leading-tight">
                  Find a business or Start your online business!
                </h2>
                <div className="space-y-4 text-sm md:text-base">
                  <div className="flex items-center justify-center lg:justify-start gap-3 group">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hidden md:flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">Discover local businesses easily</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3 group">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hidden md:flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">Get a POS and website for as little as $12/month</span>
                  </div>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col md:flex-row gap-4 min-w-fit">
                <Button className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                  Find Shops
                </Button>
                <Button variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-6 py-3 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm" asChild>
                  <Link to="/list-business">
                    List your business
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Categories</h2>
          
          <div className="relative group overflow-hidden">
            <Swiper
              spaceBetween={15}
              slidesPerView="auto"
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                reverseDirection: false,
              }}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              allowTouchMove={true}
              grabCursor={true}
              touchRatio={1}
              modules={[Autoplay, Navigation]}
              className="popular-categories-swiper"
            >
              {[
                { id: 1, image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=310&h=160&fit=crop", link: "https://example.com/category1" },
                { id: 2, image: "https://images.unsplash.com/photo-1509316975850-ff9c5bee0cd9?w=310&h=160&fit=crop", link: "https://example.com/category2" },
                { id: 3, image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=310&h=160&fit=crop", link: "https://example.com/category3" },
                { id: 4, image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=310&h=160&fit=crop", link: "https://example.com/category4" },
                { id: 5, image: "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=310&h=160&fit=crop", link: "https://example.com/category5" },
                { id: 6, image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=310&h=160&fit=crop", link: "https://example.com/category6" },
                { id: 7, image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=310&h=160&fit=crop", link: "https://example.com/category7" },
                { id: 8, image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=310&h=160&fit=crop", link: "https://example.com/category8" },
                { id: 9, image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=310&h=160&fit=crop", link: "https://example.com/category9" },
                { id: 10, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=310&h=160&fit=crop", link: "https://example.com/category10" },
                { id: 11, image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=310&h=160&fit=crop", link: "https://example.com/category11" },
                { id: 12, image: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=310&h=160&fit=crop", link: "https://example.com/category12" }
              ].map((category) => (
                <SwiperSlide key={category.id} className="!w-[280px] sm:!w-[310px]">
                  <a 
                    href={category.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  >
                    <img
                      src={category.image}
                      alt={`Category ${category.id}`}
                      className="w-full h-[160px] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation Buttons */}
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {[
              { id: 1, image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=320&h=70&fit=crop", name: "Laptops", bgColor: "bg-pink-500", link: "#laptops" },
              { id: 2, image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=320&h=70&fit=crop", name: "MacBooks", bgColor: "bg-pink-500", link: "#macbooks" },
              { id: 3, image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=320&h=70&fit=crop", name: "Gaming", bgColor: "bg-pink-500", link: "#gaming" },
              { id: 4, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&h=70&fit=crop", name: "Workstations", bgColor: "bg-gradient-to-r from-orange-400 to-orange-500", link: "#workstations" },
              { id: 5, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=320&h=70&fit=crop", name: "Desks", bgColor: "bg-gradient-to-r from-teal-400 to-orange-400", link: "#desks" },
              { id: 6, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=320&h=70&fit=crop", name: "Phones", bgColor: "bg-gradient-to-r from-teal-500 to-orange-500", link: "#phones" },
              { id: 7, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=320&h=70&fit=crop", name: "Tablets", bgColor: "bg-gradient-to-r from-orange-500 to-orange-600", link: "#tablets" },
              { id: 8, image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=320&h=70&fit=crop", name: "Audio", bgColor: "bg-gradient-to-r from-teal-400 to-orange-400", link: "#audio" },
              { id: 9, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=320&h=70&fit=crop", name: "Furniture", bgColor: "bg-gradient-to-r from-purple-500 to-purple-600", link: "#furniture" },
              { id: 10, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=320&h=70&fit=crop", name: "Appliances", bgColor: "bg-gradient-to-r from-purple-500 to-purple-600", link: "#appliances" },
              { id: 11, image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=320&h=70&fit=crop", name: "Home", bgColor: "bg-gradient-to-r from-purple-500 to-purple-600", link: "#home" },
              { id: 12, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=70&fit=crop", name: "Footwear", bgColor: "bg-gradient-to-r from-purple-500 to-purple-600", link: "#footwear" }
            ].map((product) => (
              <a 
                key={product.id} 
                href={product.link}
                className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer block transition-all duration-300 hover:ring-4 hover:ring-primary"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[70px] object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-between p-3 text-white">
                  <div>
                    <h3 className="text-sm font-semibold">{product.name}.</h3>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="underline">See Shops</span>
                    <svg className="w-3 h-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          {/* Full Width Banner */}
          <div className="mt-2.5">
            <a 
              href="#all-products" 
              className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group block w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-80"></div>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1280&h=35&fit=crop"
                alt="Full width banner"
                className="w-full h-[35px] object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <h3 className="text-sm font-semibold underline">Find Your Product</h3>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Popular Businesses Section */}
      <PopularBusinesses />
      
      {/* Footer Section */}
      <Footer />
      
      {/* Mobile Navigation Bar */}
      <MobileNavBar />
    </div>
  );
};

export default Index;
