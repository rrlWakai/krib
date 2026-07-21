import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoadingScreen } from "./components/ui/LoadingScreen";

const VillaDetailPage = lazy(() =>
  import("./pages/VillaDetailPage").then((m) => ({
    default: m.VillaDetailPage,
  })),
);
const GalleryPage = lazy(() =>
  import("./pages/GalleryPage").then((m) => ({ default: m.GalleryPage })),
);
const LocationPage = lazy(() =>
  import("./pages/LocationPage").then((m) => ({ default: m.LocationPage })),
);
const MyReservationPage = lazy(() =>
  import("./pages/MyReservationPage").then((m) => ({ default: m.MyReservationPage })),
);

// Admin pages (lazy loaded)
const AdminLayout = lazy(() =>
  import("./admin/layout/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const AdminDashboard = lazy(() =>
  import("./admin/pages/Dashboard").then((m) => ({ default: m.default })),
);
const AdminReservations = lazy(() =>
  import("./admin/pages/Reservations").then((m) => ({ default: m.default })),
);
const AdminReservationDetail = lazy(() =>
  import("./admin/pages/ReservationDetail").then((m) => ({ default: m.default })),
);
const AdminCalendar = lazy(() =>
  import("./admin/pages/Calendar").then((m) => ({ default: m.default })),
);
const AdminGuests = lazy(() =>
  import("./admin/pages/Guests").then((m) => ({ default: m.default })),
);
const AdminPayments = lazy(() =>
  import("./admin/pages/Payments").then((m) => ({ default: m.default })),
);
const AdminDiscounts = lazy(() =>
  import("./admin/pages/Discounts").then((m) => ({ default: m.default })),
);
const AdminVillas = lazy(() =>
  import("./admin/pages/Villas").then((m) => ({ default: m.default })),
);
const AdminMediaLibrary = lazy(() =>
  import("./admin/pages/MediaLibrary").then((m) => ({ default: m.default })),
);
const AdminMessages = lazy(() =>
  import("./admin/pages/Messages").then((m) => ({ default: m.default })),
);
const AdminReports = lazy(() =>
  import("./admin/pages/Reports").then((m) => ({ default: m.default })),
);
const AdminSettings = lazy(() =>
  import("./admin/pages/Settings").then((m) => ({ default: m.default })),
);

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function MainLayout({ loading, setLoading }: { loading: boolean; setLoading: (l: boolean) => void }) {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (loading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [loading]);

  // Scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <LoadingScreen
            onComplete={() => setLoading(false)}
            currentPath={location.pathname}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={loading ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col min-h-screen"
      >
        <Navbar />
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/krib-1" element={<VillaDetailPage />} />
                <Route path="/krib-2" element={<VillaDetailPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/location" element={<LocationPage />} />
                <Route path="/my-reservation" element={<MyReservationPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="reservations" element={<AdminReservations />} />
                  <Route path="reservations/:id" element={<AdminReservationDetail />} />
                  <Route path="calendar" element={<AdminCalendar />} />
                  <Route path="guests" element={<AdminGuests />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="discounts" element={<AdminDiscounts />} />
                  <Route path="villas" element={<AdminVillas />} />
                  <Route path="media" element={<AdminMediaLibrary />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </div>
        <Footer />
      </motion.div>
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <MainLayout loading={loading} setLoading={setLoading} />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
