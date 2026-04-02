import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="flex justify-between items-center px-[110px] py-5">
            {/* Logo */}
            <section className="w-[150px] ">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={150}
                    height={150}
                    priority
                    style={{ width: "auto", height: "auto" }}
                />
          
            </section>
            {/* Menu */}
            <section className="font-poppins text-[15px] ">
                <ul className="flex items-center gap-10">
                    <li className="transition-all duration-300 active:font-bold hover:text-orange">
                        <Link href="/">Home</Link>
                    </li>
                    <li className="transition-all duration-300 active:font-bold hover:text-orange">
                        <Link href="/">About</Link>
                    </li>
                    <li className="transition-all duration-300 active:font-bold hover:text-orange">
                        <Link href="/">Services</Link>
                    </li>
                    <li className="transition-all duration-300 active:font-bold hover:text-orange">
                        <Link href="/">Portfolio</Link>
                    </li>
                    <li className="transition-all duration-300 active:font-bold hover:text-orange">
                        <Link href="/">Price Calculator</Link>
                    </li>
                    <li className="transition-all duration-300 active:font-bold hover:text-orange">
                        <Link href="/">Blogs</Link>
                    </li>
                    <li className="transition-all duration-300 active:font-bold hover:text-orange">
                        <Link href="/">Contact</Link>
                    </li>
                </ul>
            </section>
        </header>
    );
}