export default function PriceCard({ cash, credit }) {
  return (
    <div className="flex justify-center">
      <div className="bg-white max-w-full justify-self-center w-full sm:w-1/2 lg:w-1/3 px-3 py-5 mb-5 border border-gray-200 shadow-md rounded-xl flex justify-between font-bold">
        <div className="text-green-500 text-center px-3">
          <p>
            RS. <span>{cash}</span>
          </p>
          <p className="font-medium text-xs text-gray-500 font-gulzar">
            آپ نےلینا ہے
          </p>
        </div>
        <div className="w-[1px] h-12 bg-gray-300 inline-flex"></div>
        <div className="text-red-500 text-center px-3">
          <p>
            RS. <span>{credit}</span>
          </p>
          <p className="font-medium text-xs text-gray-500 font-gulzar">
            آپ کو دینے ہیں
          </p>
        </div>
      </div>
    </div>
  );
}
