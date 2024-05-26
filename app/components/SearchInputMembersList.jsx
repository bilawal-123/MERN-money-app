const { TbSearch } = require("react-icons/tb");

export default function SearchInput({ searchInput, handleInputChange }) {
  return (
    <div className="block relative sm:mt-0 w-full sm:w-auto">
      <span className="h-full absolute inset-y-0 right-0 flex items-center pr-2">
        <TbSearch />
      </span>
      <input
        value={searchInput}
        onChange={handleInputChange}
        placeholder="تلاش کریں"
        className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pr-8 pl-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none font-gulzar"
      />
    </div>
  );
}
