import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Sprout, Home, Award, Handshake } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          The Reyes Rebollar Legacy
        </h1>
        <p className="text-xl text-muted-foreground">
          A story of roots, growth, and unwavering family values
        </p>
      </div>

      {/* Origin Story */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/reyesrebollar_logo.png"
              alt="Reyes Rebollar Properties"
              fill
              className="object-contain bg-gray-100 p-8"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">From Los Limones to California</h2>
            <p className="text-lg text-muted-foreground mb-4">
              The Reyes Rebollar family story begins in the fertile lands of Los Limones, 
              Michoacán, Mexico, where generations cultivated the earth and harvested the 
              bounty of lime groves that gave the town its name. Each season brought rich 
              harvests, but more importantly, it instilled values that would transcend borders 
              and generations.
            </p>
            <p className="text-lg text-muted-foreground">
              Just as the lime trees flourished year after year with careful attention and 
              dedication, so too did the family's commitment to hard work, integrity, and 
              collective growth. These weren't just crops they were tending—they were 
              cultivating a legacy.
            </p>
          </div>
        </div>
      </div>

      {/* The Journey */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-none shadow-lg">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-center">A Journey of Growth</h2>
            <p className="text-lg text-muted-foreground mb-4">
              The transition from the agricultural fields of Michoacán to the real estate 
              landscapes of California was not just a change in geography—it was an evolution 
              of the same fundamental principles. The family brought with them the understanding 
              that true wealth is not measured merely in what you possess, but in what you 
              build, nurture, and pass on to future generations.
            </p>
            <p className="text-lg text-muted-foreground">
              Like the careful cultivation of lime groves that required patience, knowledge, 
              and foresight, the Reyes Rebollar approach to property investment and management 
              reflects the same thoughtful stewardship. Each property is not just an asset—it's 
              a testament to the family's commitment to building something lasting and meaningful.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Family Values */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Family Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Handshake className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Honesty & Integrity</h3>
              <p className="text-muted-foreground">
                Our word is our bond. We conduct every transaction and relationship with 
                unwavering honesty and transparency, just as our ancestors did in their 
                dealings with the land and community.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hard Work & Dedication</h3>
              <p className="text-muted-foreground">
                From dawn in the lime groves to managing properties today, we understand 
                that success is cultivated through consistent effort, attention to detail, 
                and unwavering dedication to excellence.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Family & Togetherness</h3>
              <p className="text-muted-foreground">
                We grow together, support one another, and make decisions with the collective 
                good in mind. Our strength comes from unity, just as a grove is stronger than 
                a single tree.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Connection</h3>
              <p className="text-muted-foreground">
                Whether in Los Limones or El Cajon, we believe in being part of something 
                larger than ourselves. We invest not just in properties, but in the 
                communities where we operate.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence & Pride</h3>
              <p className="text-muted-foreground">
                We take pride in everything we do, from the properties we maintain to the 
                relationships we build. Excellence is not an act but a habit passed down 
                through generations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Home className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Long-Term Vision</h3>
              <p className="text-muted-foreground">
                Like farmers who plant for future harvests, we build for generations to come. 
                Our investments are made with patience, foresight, and a commitment to 
                lasting value.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legacy Section */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-none shadow-lg">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Building a Legacy</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Today, Reyes Rebollar Properties LLC stands as a testament to the power of 
              family values applied to modern enterprise. Each property in our portfolio 
              represents more than a financial investment—it's a continuation of the same 
              principles that guided our ancestors as they worked the land in Michoacán.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              We understand that real estate, like agriculture, requires patience, expertise, 
              and a deep respect for the long-term. We're not just building a portfolio; 
              we're cultivating a legacy that honors our past while securing our future.
            </p>
            <p className="text-lg text-muted-foreground">
              As we continue to grow in El Cajon and beyond, we carry with us the lessons 
              learned in the lime groves of Los Limones: that true prosperity comes from 
              hard work, that family is our greatest strength, and that integrity is the 
              foundation upon which all lasting success is built.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Closing */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <p className="text-2xl font-semibold text-muted-foreground italic">
          "From the soil of Michoacán to the streets of California, 
          <br />
          our roots run deep, and our future grows bright."
        </p>
      </div>
    </div>
  );
}
