import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import CollectionDetail from "./pages/CollectionDetail";
import Onboarding from "./pages/Onboarding";
import OnboardingComplete from "./pages/OnboardingComplete";
import Profile from "./pages/Profile";
import MuseumDetail from "./pages/MuseumDetail";
import DesignerDetail from "./pages/DesignerDetail";
import MuseumList from "./pages/MuseumList";
import DesignerList from "./pages/DesignerList";
import WorkDetail from "./pages/WorkDetail";
import WorkList from "./pages/WorkList";
import CollectionList from "./pages/CollectionList";
import MyWorksManagement from "./pages/MyWorksManagement";
import Login from "./pages/Login";
import EditProfile from "./pages/EditProfile";
import AdminReviewWorks from "./pages/AdminReviewWorks";
import EditCollection from "./pages/EditCollection";
import LoadingScreen from "./components/LoadingScreen";
import ScrollProgress from "./components/ScrollProgress";
import ScrollToTop from "./components/ScrollToTop";
import { useState, useEffect } from "react";
import { useLanguageTransition } from "./hooks/useLanguageTransition";
import { preloadCriticalImages } from "./lib/preloadImages";
import { images } from "./config/images";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/collections"} component={CollectionList} />
      <Route path={"/collection/:id"} component={CollectionDetail} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/onboarding-complete"} component={OnboardingComplete} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/museums"} component={MuseumList} />
      <Route path={"/museum/:id"} component={MuseumDetail} />
      <Route path={"/designers"} component={DesignerList} />
      <Route path={"/designer/:id"} component={DesignerDetail} />
      <Route path={"/works"} component={WorkList} />
      <Route path={"/work/:id"} component={WorkDetail} />
      <Route path={"/my-works"} component={MyWorksManagement} />
      <Route path={"/login"} component={Login} />
      <Route path={"/edit-profile"} component={EditProfile} />
      <Route path={"/admin/review-works"} component={AdminReviewWorks} />
      <Route path={"/collections/:id/edit"} component={EditCollection} />
      <Route path={"/:rest*"} component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const { isTransitioning } = useLanguageTransition();

  useEffect(() => {
    // 检查是否已经加载过（使用sessionStorage，仅在当前会话中生效）
    const hasLoaded = sessionStorage.getItem('hasLoadedBefore');
    if (hasLoaded) {
      setIsLoading(false);
      setShowContent(true);
    } else {
      // 首次访问，预加载关键图片
      const criticalImages = [
        images.logo.main,
        images.heroBanners[0].url,
      ];
      preloadCriticalImages(criticalImages);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasLoadedBefore', 'true');
    setIsLoading(false);
    // 稍微延迟显示内容，确保加载动画完全消失
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <ScrollProgress />
            {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
            {showContent && (
              <div 
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: isTransitioning ? 0 : 1 }}
              >
                <Router />
              </div>
            )}
            <ScrollToTop />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
