-- DropForeignKey
ALTER TABLE "HotelAdmin" DROP CONSTRAINT "HotelAdmin_restaurantId_fkey";

-- AddForeignKey
ALTER TABLE "HotelAdmin" ADD CONSTRAINT "HotelAdmin_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
