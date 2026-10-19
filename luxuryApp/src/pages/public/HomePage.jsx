import { useCallback } from "react";
import CallToAction from "../../components/home/CallToAction";
import Hero from "../../components/home/Hero";
import IntroSplash from "../../components/home/IntroSplash";
import ProcessSteps from "../../components/home/ProcessSteps";
import ServicesPreview from "../../components/home/ServicesPreview";
import StatsStrip from "../../components/home/StatsStrip";
import Testimonials from "../../components/home/Testimonials";
import WhyUs from "../../components/home/WhyUs";
import { useFirstVisit } from "../../hooks/useFirstVisit";

const HomePage = () => {
  const [firstVisit, markSeen] = useFirstVisit("luxurysmile:intro-vista");
  const finishIntro = useCallback(() => markSeen(), [markSeen]);

  return (
    <>
      <IntroSplash show={firstVisit} onDone={finishIntro} />
      {/* El diente 3D entra en escena cuando termina la intro */}
      <Hero ready={!firstVisit} />
      <StatsStrip />
      <ServicesPreview />
      <WhyUs />
      <ProcessSteps />
      <Testimonials />
      <CallToAction />
    </>
  );
};

export default HomePage;
