import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, AlertTriangle, BarChart3 } from "lucide-react";
import Link from "next/link";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <Card className="w-full md:w-64">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 flex flex-col justify-between">
      <main className="flex-grow flex flex-col items-center text-center px-4 py-12">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-800 tracking-tight">
          Welcome to <span className="text-blue-600">DisasterPulse</span>
        </h1>
        <p className="text-xl mb-12 text-gray-600 max-w-2xl">
          Empowering communities with real-time disaster monitoring and
          AI-driven analysis
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/updates">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View Disaster Updates
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Globe className="w-6 h-6 text-blue-600" />}
            title="Global Coverage"
            description="Monitor disasters worldwide with our comprehensive tracking system."
          />
          <FeatureCard
            icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
            title="Real-time Alerts"
            description="Receive instant notifications about emerging threats and updates."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6 text-green-600" />}
            title="AI-Powered Insights"
            description="Gain valuable insights with our advanced AI analysis of disaster data."
          />
        </div>

        <Card className="w-full max-w-2xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Stay Informed, Stay Safe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              DisasterPulse transforms complex disaster data into clear,
              actionable information. Our AI-driven analysis helps you
              understand the situation quickly and make informed decisions.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center"></CardFooter>
        </Card>
      </main>

      <footer className="w-full py-6 px-4 bg-gray-800 text-white text-center">
        <p>&copy; 2024 DisasterPulse. All rights reserved.</p>
      </footer>
    </div>
  );
}
