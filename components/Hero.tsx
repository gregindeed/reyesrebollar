import Image from "next/image";

export function Hero() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
      {/* Background Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src="/el-cajon-aerial.jpg"
          alt="Aerial view of El Cajon, CA"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-8 md:px-12">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Reyes Rebollar Properties
            </h1>
            <p className="text-lg md:text-xl mb-6 text-gray-200">
              Building excellence in real estate holdings and property management in El Cajon, California
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm text-gray-300">Properties</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">10</div>
                <div className="text-sm text-gray-300">Total Units</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">$2.1M</div>
                <div className="text-sm text-gray-300">Portfolio Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
