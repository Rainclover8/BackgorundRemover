"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Upload, ImageIcon, Download, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import Loader from "./components/ui/loader";
import axios from "axios";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sayfa yenilendiğinde localStorage'dan resmi kontrol et
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) {
      setImage(savedImage);
    }

    const savedProcessedImage = localStorage.getItem("processedImage");
    if (savedProcessedImage) {
      setProcessedImage(savedProcessedImage);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImage(imageUrl);
        localStorage.setItem("uploadedImage", imageUrl); // Resmi localStorage'a kaydet
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!selectedFile) return alert("Lütfen bir resim yükleyin!");

    setLoading(true);

    const formData = new FormData();
    formData.append("image_file", selectedFile);
    formData.append("size", "auto");

    try {
      const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
        headers: {
          "X-Api-Key": process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY, // API anahtarını buradan alıyoruz
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const imageURL = URL.createObjectURL(response.data);
      setProcessedImage(imageURL);
      setDownloadUrl(imageURL);
      localStorage.setItem("processedImage", imageURL); // İşlenmiş görseli localStorage'a kaydet
    } catch (error) {
      console.error("Hata:", error);
      alert("Arka plan kaldırılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "background_removed.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white">
      <Head>
        <title>Arka Plan Silme Aracı</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:px-20">
        <h1 className="text-4xl font-bold mb-8 text-black">Arka Plan Silme Aracı</h1>

        <div className="w-full max-w-3xl">
          <div className="mb-8">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="imageUpload" />
            <label
              htmlFor="imageUpload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              {image ? (
                <div className="relative w-full h-full">
                  <Image src={image} alt="Uploaded image" layout="fill" objectFit="contain" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Resim yüklemek için tıklayın</span> veya sürükleyip bırakın
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG veya GIF (MAX. 5MB)</p>
                </div>
              )}
            </label>
          </div>

          {image && (
            <Button onClick={removeBackground} className="mb-8 text-black" disabled={loading}>
              {loading ? <Loader /> : <ImageIcon className="mr-2 h-4 w-4 text-black" />}
              {loading ? "İşleniyor..." : "Arka Planı Kaldır"}
            </Button>
          )}

          {processedImage && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-black">İşlenmiş Görüntü</h2>
              <div className="relative w-full h-64">
                <Image src={processedImage} alt="Processed image" layout="fill" objectFit="contain" />
              </div>
              <Button onClick={handleDownload} className="mt-4 text-black">
                <Download className="mr-2 h-4 w-4" /> İndir
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t text-black">
        <a
          className="flex items-center justify-center"
          href="https://barancicek.space"
          target="_blank"
          rel="noopener noreferrer"
        >
          Developing by Baran Çiçek
        </a>
      </footer>
    </div>
  );
}
