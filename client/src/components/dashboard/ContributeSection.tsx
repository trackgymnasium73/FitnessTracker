import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import AddFoodForm from "@/components/nutrition/AddFoodForm";

export default function ContributeSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <section className="mb-8">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-8 md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left md:w-2/3">
            <h2 className="text-xl font-bold text-white">Help us grow our food database!</h2>
            <p className="mt-2 text-amber-100">Add missing food items to our database and earn points that you can redeem for discounts in our shop.</p>
          </div>
          <div className="mt-6 text-center md:mt-0 md:w-1/3">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-amber-600 hover:bg-amber-50 shadow-md">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Food Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Food to Database</DialogTitle>
                </DialogHeader>
                <AddFoodForm isContribution onSuccess={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
}
