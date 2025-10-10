import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PopularServiceCard } from '@/components/PopularServiceCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  towns?: string;
  province_district?: string;
  address?: string;
  rating?: number;
  image_url?: string;
  website?: string;
  information_website?: string;
  product_images?: string[] | null;
  service_images?: string[] | null;
  business_options?: string[] | null;
  base_price?: number | null;
  starting_price?: string | null;
  license_expired_date?: string | null;
  products_catalog?: string | null;
  facebook_page?: string | null;
  tiktok_url?: string | null;
  phone?: string | null;
  popular_products?: string | null;
  business_name?: string | null;
}

const PopularServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Fetch latest 5 services from services table with business details
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          category_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        return;
      }

      console.log('Fetched services:', servicesData);

      // For each service, fetch corresponding business data via business_resources
      const servicesWithBusinessData = await Promise.all(
        (servicesData || []).map(async (service) => {
          // Step 1: Find business_resources that offer this service
          const { data: resourceData } = await supabase
            .from('business_resources')
            .select('business_id')
            .eq('service_id', service.id)
            .limit(1)
            .maybeSingle();

          console.log('Resource data for service', service.id, ':', resourceData);

          let businessData = null;
          if (resourceData?.business_id) {
            // Step 2: Get the business data using the business_id from the resource
            const { data } = await supabase
              .from('businesses')
              .select('*')
              .eq('id', resourceData.business_id)
              .eq('searchable_business', true)
              .maybeSingle();
            
            businessData = data;
          }

          console.log('Business data for service', service.id, ':', businessData);

          // Combine service and business data
          return {
            id: String(service.service_key || service.id),
            name: businessData?.name || 'Service',
            business_name: businessData?.name,
            description: service.services_description,
            category: businessData?.category,
            towns: businessData?.towns,
            province_district: businessData?.province_district,
            address: businessData?.address,
            rating: businessData?.rating,
            image_url: businessData?.image_url,
            website: businessData?.website,
            information_website: businessData?.information_website,
            service_images: service.service_images,
            product_images: businessData?.product_images,
            business_options: businessData?.business_options,
            base_price: null,
            starting_price: businessData?.starting_price,
            license_expired_date: businessData?.license_expired_date,
            products_catalog: service.facilities,
            facebook_page: businessData?.facebook_page,
            tiktok_url: businessData?.tiktok_url,
            phone: service.contact_phone || businessData?.phone,
            popular_products: service.popular_products,
          };
        })
      );

      console.log('Final services with business data:', servicesWithBusinessData);
      
      setServices(servicesWithBusinessData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Services</h2>
          <div className="flex justify-center">
            <div className="text-muted-foreground">Loading services...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Services</h2>
        
        <div className="hidden md:block bg-muted/30 rounded-2xl p-8 mx-4 overflow-hidden">
          <div className="relative">
            <Swiper
              modules={[Pagination]}
              pagination={{ 
                clickable: true,
                dynamicBullets: false,
                horizontalClass: 'swiper-pagination-horizontal',
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
              }}
              spaceBetween={20}
              slidesPerView={'auto'}
              loop={false}
              grabCursor={true}
              centeredSlides={false}
              className="popular-businesses-swiper pb-12"
            >
            {services.map((service) => (
              <SwiperSlide key={service.id} className="!w-[260px] sm:!w-[290px]">
                <PopularServiceCard service={service} />
              </SwiperSlide>
            ))}
            
            <SwiperSlide key="discover-more" className="!w-[260px] sm:!w-[290px]">
              <Card className="group w-[290px] h-[555px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative overflow-hidden rounded-t-lg h-[290px] bg-gradient-to-br from-slate-700 to-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=290&h=290&fit=crop"
                    alt="Discover more services"
                    className="w-full h-[290px] opacity-30"
                    style={{ objectFit: 'none', objectPosition: 'top left' }}
                  />
                </div>
                
                <CardContent className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <h3 className="text-white text-lg font-bold">
                      Discover more services
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explore hundreds of services and find exactly what you're looking for
                    </p>
                    <Button 
                      style={{ backgroundColor: '#EAB33A' }}
                      className="w-full h-10 text-black font-medium hover:opacity-90 transition-opacity"
                    >
                      Go Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
           </Swiper>
          </div>
        </div>
        
        <div className="block md:hidden">
          <Swiper
            modules={[Pagination]}
            pagination={{ 
              clickable: true,
              dynamicBullets: false,
              horizontalClass: 'swiper-pagination-horizontal'
            }}
            spaceBetween={16}
            slidesPerView={'auto'}
            loop={false}
            grabCursor={true}
            centeredSlides={false}
            className="popular-businesses-swiper-mobile pb-12 pl-4"
            style={{ '--swiper-pagination-color': 'var(--primary)' } as React.CSSProperties}
          >
          {services.map((service) => (
            <SwiperSlide key={service.id} className="!w-[290px] first:!ml-0 last:!mr-4">
              <PopularServiceCard service={service} />
            </SwiperSlide>
          ))}
            
            <SwiperSlide key="discover-more-mobile" className="!w-[290px] last:!mr-4">
              <Card className="group w-[290px] h-[555px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative overflow-hidden rounded-t-lg h-[290px] bg-gradient-to-br from-slate-700 to-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=290&h=290&fit=crop"
                    alt="Discover more services"
                    className="w-full h-[290px] opacity-30"
                    style={{ objectFit: 'none', objectPosition: 'top left' }}
                  />
                </div>
                
                <CardContent className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <h3 className="text-white text-lg font-bold">
                      Discover more services
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explore hundreds of services and find exactly what you're looking for
                    </p>
                    <Button 
                      style={{ backgroundColor: '#EAB33A' }}
                      className="w-full h-10 text-black font-medium hover:opacity-90 transition-opacity"
                    >
                      Go Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default PopularServices;
