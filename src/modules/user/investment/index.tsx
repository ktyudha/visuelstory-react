import { Link } from "react-router-dom";
import Metadata from "@components/Metadata";
import PageHero from "../shared/PageHero";
import { img } from "../shared/images";
import { btnSolid, linkText } from "../shared/ui";

export default function Investment() {
  const dummyPricelist = [
    {
      image: "pricelist-1",
      category: "Pricelist",
      client: "Short Event",
      url: "whatsapp://send?phone=6285144920131&text=Halo Visuelstory, Saya Mau Pricelist Short Event.",
    },
    {
      image: "pricelist-1",
      category: "Pricelist",
      client: "Unduh Mantu",
      url: "whatsapp://send?phone=6285144920131&text=Halo Visuelstory, Saya Mau Pricelist Unduh Mantu.",
    },
    {
      image: "pricelist-1",
      category: "Pricelist",
      client: "Wedding",
      url: "whatsapp://send?phone=6285144920131&text=Halo Visuelstory, Saya Mau Pricelist Wedding.",
    },
  ];
  const openWhatsApp = (url: string) => {
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(url, "_blank", `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
  };

  return (
    <>
      <Metadata title="Investment" />
      <PageHero image="investment" eyebrow="Investment" title="Preserve your best memories" subtitle="Pilih jenis acara, lalu minta pricelist langsung lewat WhatsApp." />

      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {dummyPricelist.map((p) => (
            <article key={p.client} className="group">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-200">
                <img src={img(p.image)} alt={p.client} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:opacity-85" />
              </div>
              <div className="mt-5 flex items-end justify-between gap-4 border-b border-neutral-300 pb-5">
                <h3 className="text-xl">{p.client}</h3>
                <button onClick={() => openWhatsApp(p.url)} className={`${linkText} cursor-pointer whitespace-nowrap`}>Minta pricelist</button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-light md:text-4xl">Sudah tahu paket yang Anda mau?</h2>
          <Link to="/booking" className={`${btnSolid} mt-10`}>Booking online</Link>
        </div>
      </section>
    </>
  );
}
