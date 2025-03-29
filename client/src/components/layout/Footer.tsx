import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="#">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">About Us</span>
                About
              </a>
            </Link>
            <Link href="#">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Privacy Policy</span>
                Privacy
              </a>
            </Link>
            <Link href="#">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Terms of Service</span>
                Terms
              </a>
            </Link>
            <Link href="#">
              <a className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Contact Us</span>
                Contact
              </a>
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} TrackGymnasium. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
