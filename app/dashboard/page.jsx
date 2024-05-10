import Link from "next/link";
import { CiShop } from "react-icons/ci";
import { PiUserListBold, PiUsersDuotone } from "react-icons/pi";
import {
  TbChartAreaLineFilled,
  TbChartPie,
  TbChartPieFilled,
} from "react-icons/tb";
export default function Dashboard() {
  return (
    <div>
      <h1 className="heading1 inline-flex items-center gap-1">
        Dashboard Listing
      </h1>
      <div class="flex items-center flex-wrap -mx-4">
        <div className="relative w-full sm:w-1/2 lg:w-1/3 px-4 mb-4">
          <div class="rounded-sm border border-stroke bg-yellow-50 p-4 shadow-sm shadow-yellow-500 md:p-6 xl:p-7.5">
            <CiShop className="text-4xl text-yellow-600" />
            <h4 class="mb-2 mt-5 font-medium">Customers Stats</h4>
            <h3 class="mb-2 text-title-md font-bold text-black dark:text-white">
              7.8/10
            </h3>
            <p class="flex items-center gap-1 text-sm font-medium">
              <TbChartPie className="text-yellow-600" />
              <span class="text-meta-3">+2.5%</span>
              <span>than last Week</span>
            </p>{" "}
            <Link href="#" className="absolute top-0 left-0 w-full h-full" />
          </div>
        </div>

        <div className="w-full sm:w-1/2 lg:w-1/3 px-4 mb-4">
          <div class="relative rounded-sm border border-stroke bg-teal-50 shadow-teal-500 p-4 shadow-sm md:p-6 xl:p-7.5">
            <PiUserListBold className="text-4xl text-teal-500" />
            <h4 class="mb-2 mt-5 font-medium">Shopkeper Stats</h4>
            <h3 class="mb-2 text-title-md font-bold text-black dark:text-white">
              7.8/10
            </h3>
            <p class="flex items-center gap-1 text-sm font-medium">
              <TbChartPieFilled className="text-teal-500" />
              <span class="text-red">-1.5%</span>
              <span>than last Week</span>
            </p>
            <Link
              href={"/shopkeepers"}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 px-4 mb-4">
          <div class="relative rounded-sm border border-stroke bg-blue-50 p-4 shadow-sm shadow-blue-500 md:p-6 xl:p-7.5">
            <PiUsersDuotone className="text-4xl text-blue-500" />

            <h4 class="mb-2 mt-3 font-medium">All Stats</h4>
            <h3 class="mb-2 text-title-md font-bold text-black dark:text-white">
              $5.03
            </h3>
            <p class="flex items-center gap-1 text-sm font-medium">
              <TbChartAreaLineFilled className="text-blue-500" />

              <span class="text-meta-3">+2.6%</span>
              <span>than last Week</span>
            </p>
            <Link href={"/"} className="absolute top-0 left-0 w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
