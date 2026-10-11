import HeroSection from '../../../components/user/home/HeroSection'
import NewArrivalsSection from '../../../components/user/home/NewArrivalsSection'
import TestimonialSection from '../../../components/user/home/TestimonialSection'
import CollectionsSection from '../../../components/user/home/CollectionsSection'
import NewsletterSection from '../../../components/user/home/NewsletterSection'
import CategoryLinks from '../../../components/user/home/CategoryLinks'
import ProductShelves from '../../../components/user/home/ProductShelves'
import BenefitsSection from '../../../components/user/home/BenefitsSection'

export default function HomePage() {
  return <>
    <HeroSection />
    <CategoryLinks />
    <NewArrivalsSection />
    <CollectionsSection />
    <ProductShelves />
    <TestimonialSection />
    <NewsletterSection />
    <BenefitsSection />
  </>
}
