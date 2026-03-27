import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll window to top
        window.scrollTo(0, 0);
        
        // Also scroll page-body container for responsive design
        const pageBody = document.querySelector('.page-body');
        if (pageBody) {
            pageBody.scrollTop = 0;
        }
        
        // Small delay to ensure DOM is fully rendered
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
            if (pageBody) {
                pageBody.scrollTop = 0;
            }
        }, 50);
        
        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
