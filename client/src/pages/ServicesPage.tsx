import { useState } from "react";
import { useServices } from "../hooks/use-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ServiceBookingForm from "../components/ServiceBookingForm";
import type { Service } from "@db/schema";
import { MapPinIcon } from "lucide-react";

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { services, isLoading, error } = useServices();
  const { toast } = useToast();

  const handleBookService = (service: Service) => {
    setSelectedService(service);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading services: {error.message}</p>
      </div>
    );
  }

  if (!services?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Available Services</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
                <p className="text-sm">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    ${Number(service.price).toFixed(2)}
                  </span>
                  <Button onClick={() => handleBookService(service)}>
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
            <DialogDescription>
              Fill in the booking details and complete the payment to secure your service.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <ServiceBookingForm
              service={selectedService}
              onSuccess={() => {
                setSelectedService(null);
                toast({
                  title: "Success",
                  description: "Service booked successfully!",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}