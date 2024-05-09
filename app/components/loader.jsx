import Image from "next/image";
import styles from "./loader.module.css";
export default function Loader() {
  return (
    <div className="relative w-[1200px] h-[65vh]">
      <div className="absolute left-0 w-full h-full flex items-center justify-center mx-auto bg-opacity-20">
        {/* <Image width={100} height={100} alt="" src={"/loader.gif"} /> */}
        <div id="l19" className={styles.loader}></div>
      </div>
    </div>
  );
}
