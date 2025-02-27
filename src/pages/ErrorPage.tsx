import { FunctionComponent } from "react";
// import errorIllustration from "@/assets/images/error-illustration.svg";
// import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
// import Lucide from '@/components/Base/Lucide'

const ErrorPage: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="py-2 bg-gradient-to-b from-[#B9AA96] to-white">
        <div className="container">
          {/* BEGIN: Error Page */}
          <div className="flex flex-col items-center justify-center h-screen text-center error-page lg:flex-row lg:text-left px-8">
            <div className="mt-10 text-black lg:mt-0">
              <div className="font-medium  text-8xl">404</div>
              <div className="mt-5 mb-10">
                <h3 className="text-3xl font-medium mb-2">
                  Oh no! Page not found.
                </h3>
                <p className="text-sm font-sans font-light">
                  Sorry, it seems like the page you're looking for no longer
                  exists.
                </p>
              </div>
              <a
                className="mt-10 bg-[#B9AA96] hover:bg-[#928763] uppercase py-3 px-9 rounded-lg tracking-wider text-white cursor-pointer md:text-sm text-xs"
                onClick={() => navigate(-1)}
              >
                {/* <Lucide icon="ArrowLeft" className="mr-1" /> */}
                Back
              </a>
            </div>
          </div>
          {/* END: Error Page */}
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
