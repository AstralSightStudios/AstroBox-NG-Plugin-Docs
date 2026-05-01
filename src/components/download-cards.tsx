"use client";

import { useState } from "react";
import { ChevronRight, Watch, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import "@fontsource/maple-mono/400.css";
import { DownloadDialog, type DownloadItem } from "./download-dialog";
import { PostDownloadDialog } from "./post-download-dialog";

function WinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="40" height="40" rx="20" stroke="currentColor" strokeOpacity="0.1"/>
    <mask id="win-mask0_4942_15704" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="9" y="9" width="23" height="23">
    <path d="M31.5 9.5H9.5V31.5H31.5V9.5Z" fill="white"/>
    </mask>
    <g mask="url(#win-mask0_4942_15704)">
    <path d="M12.25 12.25H19.9844V19.9844H12.25V12.25ZM12.25 21.0156H19.9844V28.75H12.25V21.0156ZM21.0156 12.25H28.75V19.9844H21.0156V12.25ZM21.0156 21.0156H28.75V28.75H21.0156V21.0156Z" fill="currentColor" fillOpacity="0.5"/>
    </g>
    </svg>
  );
}

function MacIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.5 20.5C0.5 9.45431 9.45431 0.5 20.5 0.5V0.5C31.5457 0.5 40.5 9.45431 40.5 20.5V20.5C40.5 31.5457 31.5457 40.5 20.5 40.5V40.5C9.45431 40.5 0.5 31.5457 0.5 20.5V20.5Z" stroke="currentColor" strokeOpacity="0.1"/>
    <g clipPath="url(#mac-clip0_4942_15714)">
    <mask id="mac-mask0_4942_15714" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="9" y="9" width="23" height="23">
    <path d="M31.5 9.5H9.5V31.5H31.5V9.5Z" fill="white"/>
    </mask>
    <g mask="url(#mac-mask0_4942_15714)">
    <path fillRule="evenodd" clipRule="evenodd" d="M22.59 12.25H22.1582C21.9385 12.25 21.7406 12.3781 21.6554 12.5806C20.2525 15.9157 19.5041 18.8763 19.4101 21.4625H21.579C21.828 21.4625 22.0348 21.5556 22.1993 21.7418C22.3641 21.9282 22.431 22.145 22.4001 22.3923C22.2858 23.3067 22.2552 24.1617 22.3082 24.9575C23.3006 24.6942 24.1169 24.1892 24.7572 23.4424C24.862 23.3202 25.0145 23.25 25.1751 23.25C25.4788 23.25 25.7251 23.4962 25.7251 23.8C25.7251 23.9313 25.6781 24.0583 25.5927 24.1579C24.7709 25.1167 23.7205 25.7502 22.4416 26.0584C22.6018 26.9485 22.8856 27.7567 23.293 28.4828C23.3865 28.6496 23.5665 28.7497 23.7578 28.7477C24.6144 28.7387 25.2596 28.7089 25.7812 28.6113C25.8746 28.5932 25.9668 28.5728 26.0589 28.5497C26.2828 28.4916 26.4833 28.4167 26.6693 28.3203C27.3756 27.9541 27.9541 27.3756 28.3203 26.6693C28.7456 25.8487 28.75 24.7462 28.75 22.59V18.41C28.75 16.2538 28.7456 15.1513 28.3203 14.3307C27.9541 13.6244 27.3756 13.0459 26.6693 12.6797C25.8487 12.2544 24.7462 12.25 22.59 12.25ZM21.7369 28.75C21.9427 28.75 22.0763 28.5312 21.9925 28.3432C21.2726 26.7303 21.0328 24.8034 21.273 22.5625H19.4C19.0963 22.5625 18.838 22.4573 18.6252 22.2468C18.4042 22.0283 18.299 21.7634 18.3098 21.4522C18.3997 18.8519 19.1107 15.9127 20.4428 12.6347C20.5167 12.4528 20.3848 12.25 20.1884 12.25H18.41C16.8986 12.25 15.9049 12.2521 15.1631 12.3999C15.0221 12.4295 14.8843 12.4649 14.746 12.5073C14.5984 12.5553 14.461 12.6122 14.3307 12.6797C13.6244 13.0459 13.0459 13.6244 12.6797 14.3307C12.2544 15.1513 12.25 16.2538 12.25 18.41V22.59C12.25 24.7462 12.2544 25.8487 12.6797 26.6693C13.0459 27.3756 13.6244 27.9541 14.3307 28.3203C15.1513 28.7456 16.2538 28.75 18.41 28.75H21.7369ZM15.55 18.85V17.2C15.55 16.8962 15.7962 16.65 16.1 16.65C16.4038 16.65 16.65 16.8962 16.65 17.2V18.85C16.65 19.1538 16.4038 19.4 16.1 19.4C15.7962 19.4 15.55 19.1538 15.55 18.85ZM24.35 17.2V18.85C24.35 19.1538 24.5962 19.4 24.9 19.4C25.2038 19.4 25.45 19.1538 25.45 18.85V17.2C25.45 16.8962 25.2038 16.65 24.9 16.65C24.5962 16.65 24.35 16.8962 24.35 17.2ZM19.9084 25.1542C18.3464 25.0416 17.1244 24.4709 16.2426 23.4421C16.1381 23.3202 15.9856 23.25 15.825 23.25C15.5212 23.25 15.275 23.4962 15.275 23.8C15.275 23.9313 15.322 24.0583 15.4074 24.1579C16.514 25.4313 18.0111 26.1301 19.8987 26.2543C20.2242 26.2757 20.474 25.979 20.4381 25.6603C20.4073 25.3881 20.1817 25.1739 19.9084 25.1542Z" fill="currentColor" fillOpacity="0.5"/>
    </g>
    </g>
    <defs>
    <clipPath id="mac-clip0_4942_15714">
    <rect width="22" height="22" fill="white" transform="translate(9.5 9.5)"/>
    </clipPath>
    </defs>
    </svg>
  );
}

function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.5 20.5C0.5 9.45431 9.45431 0.5 20.5 0.5V0.5C31.5457 0.5 40.5 9.45431 40.5 20.5V20.5C40.5 31.5457 31.5457 40.5 20.5 40.5V40.5C9.45431 40.5 0.5 31.5457 0.5 20.5V20.5Z" stroke="currentColor" strokeOpacity="0.1"/>
    <mask id="linux-mask0_4942_15744" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="9" y="9" width="23" height="23">
    <path d="M31.5 9.5H9.5V31.5H31.5V9.5Z" fill="white"/>
    </mask>
    <g mask="url(#linux-mask0_4942_15744)">
    <path fillRule="evenodd" clipRule="evenodd" d="M14.6493 27.0717C14.8787 26.7609 15.1003 26.4694 15.311 26.2043C15.8258 25.5526 16.0601 24.8519 16.032 24.0522C15.9814 22.6233 15.9094 21.1949 15.856 19.7666C15.7262 16.3181 17.5363 14.7726 19.5421 14.4921C21.9417 14.1566 23.9053 15.1367 24.8232 17.2696C25.3402 18.4719 25.4931 19.7407 25.5569 21.0299C25.591 21.7229 25.6191 22.4176 25.6774 23.1089C25.7544 24.028 26.1119 24.837 26.6299 25.6015C26.7752 25.816 26.9385 26.0498 27.1162 26.3C28.5259 24.6969 29.3023 22.6345 29.2997 20.4997C29.2997 15.6394 25.3595 11.6997 20.4997 11.6997C15.641 11.6997 11.7002 15.6394 11.7002 20.4997C11.6976 23.0116 12.7712 25.4037 14.6493 27.0717ZM21.5078 21.669C21.6282 21.718 21.7487 21.768 21.868 21.8203C21.9654 21.8632 22.0677 21.9182 22.1683 21.9847C22.2063 21.9598 22.2411 21.9303 22.2717 21.8967C22.9482 21.1691 23.0137 19.8975 22.3872 19.1247C21.7718 18.3657 20.7306 18.3954 20.1625 19.1907C19.8418 19.639 19.7027 20.1444 19.7868 20.6878C19.8105 20.8385 19.8253 20.9502 19.8429 21.0382C20.1186 21.1421 20.3947 21.2447 20.6712 21.3462C20.6156 21.2118 20.5905 21.0668 20.5975 20.9216C20.6184 20.4711 20.9171 20.1191 21.2652 20.1351C21.6134 20.151 21.8785 20.5289 21.8581 20.9788C21.8438 21.2813 21.7036 21.537 21.5078 21.669ZM16.884 21.9214C16.4 21.2295 16.3901 20.0916 16.8631 19.3942C17.3372 18.6957 18.1297 18.6946 18.5879 19.4057C18.8997 19.8897 18.9998 20.4254 18.8942 20.993C18.7842 21.0326 18.6764 21.0794 18.5697 21.1415C18.4471 21.2136 18.3321 21.2845 18.221 21.3549C18.2331 21.2631 18.2326 21.1641 18.2155 21.0612C18.1501 20.69 17.8993 20.4238 17.6545 20.4661C17.4098 20.509 17.2635 20.8445 17.3289 21.2158C17.3707 21.46 17.4939 21.6563 17.6424 21.752C17.4345 21.906 17.2547 22.0523 17.1051 22.1832C17.0391 22.1271 16.9676 22.0408 16.884 21.9214ZM19.3166 21.8153C19.1595 21.818 19.0061 21.8633 18.8727 21.9462C18.0021 22.4544 17.4477 22.9505 17.1556 23.2679C17.0946 23.3163 17.0814 23.4824 17.1089 23.5759C17.2387 24.0159 18.502 25.0169 19.0053 25.0169C19.0181 25.0167 19.031 25.0158 19.0438 25.0141C20.0107 24.8986 22.2624 23.7546 22.1991 23.192C22.1755 22.9797 21.9032 22.7668 21.6926 22.675C21.0122 22.3774 20.3066 22.1376 19.6125 21.8725C19.518 21.8355 19.418 21.8158 19.3166 21.8153ZM24.7985 28.1793C23.4858 28.9158 22.0054 29.3016 20.5002 29.2997H20.4991C18.8264 29.3021 17.1879 28.8256 15.7774 27.9263C16.3285 26.6569 16.7762 25.5855 16.7146 24.6291C16.9098 24.8355 17.1213 25.0259 17.3471 25.1983C17.9911 25.6955 18.5488 25.948 19.0053 25.948C19.0548 25.948 19.1054 25.9447 19.1538 25.9392C19.86 25.8556 20.8066 25.4447 21.4561 25.0878C22.1222 24.7226 22.5765 24.375 22.8432 24.0208C22.9076 24.0554 22.9642 24.1176 23.0121 24.2155C23.3426 24.8953 23.7232 25.5531 24.0092 26.2499C24.2732 26.8923 24.5372 27.5353 24.7985 28.1793Z" fill="currentColor" fillOpacity="0.5"/>
    </g>
    </svg>
  );
}

function IosIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.5 20.5C0.5 9.45431 9.45431 0.5 20.5 0.5V0.5C31.5457 0.5 40.5 9.45431 40.5 20.5V20.5C40.5 31.5457 31.5457 40.5 20.5 40.5V40.5C9.45431 40.5 0.5 31.5457 0.5 20.5V20.5Z" stroke="currentColor" strokeOpacity="0.1"/>
    <path d="M25.3248 21.0527C25.3497 23.7281 27.6718 24.6184 27.6975 24.6297C27.6778 24.6925 27.3265 25.8984 26.4741 27.1441C25.7373 28.221 24.9725 29.294 23.7678 29.3162C22.5842 29.338 22.2035 28.6143 20.8502 28.6143C19.4972 28.6143 19.0743 29.294 17.9538 29.338C16.791 29.3821 15.9054 28.1735 15.1625 27.1005C13.6443 24.9057 12.4842 20.8984 14.042 18.1934C14.8159 16.8501 16.199 15.9995 17.7001 15.9777C18.8419 15.9559 19.9197 16.7459 20.6178 16.7459C21.3154 16.7459 22.6251 15.7959 24.002 15.9354C24.5784 15.9594 26.1964 16.1682 27.2354 17.689C27.1516 17.7409 25.3047 18.816 25.3248 21.0527M23.1002 14.4833C23.7176 13.736 24.1331 12.6958 24.0197 11.6606C23.1298 11.6964 22.0538 12.2536 21.4155 13.0005C20.8435 13.6619 20.3425 14.7205 20.4777 15.7351C21.4696 15.8119 22.4828 15.2311 23.1002 14.4833Z" fill="currentColor" fillOpacity="0.5"/>
    </svg>
  );
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.5 20.5C0.5 9.45431 9.45431 0.5 20.5 0.5V0.5C31.5457 0.5 40.5 9.45431 40.5 20.5V20.5C40.5 31.5457 31.5457 40.5 20.5 40.5V40.5C9.45431 40.5 0.5 31.5457 0.5 20.5V20.5Z" stroke="currentColor" strokeOpacity="0.1"/>
    <mask id="android-mask0_4942_15731" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="9" y="9" width="23" height="23">
    <path d="M31.5 9.5H9.5V31.5H31.5V9.5Z" fill="white"/>
    </mask>
    <g mask="url(#android-mask0_4942_15731)">
    <path fillRule="evenodd" clipRule="evenodd" d="M24.5508 22.1078C24.1387 22.1193 23.7984 21.7886 23.7979 21.3763C23.7975 20.9641 24.1371 20.6327 24.5492 20.6432C24.9461 20.6534 25.2626 20.9778 25.263 21.3748C25.2635 21.7717 24.9476 22.0968 24.5508 22.1078ZM16.4498 22.1078C16.0377 22.1191 15.6975 21.7883 15.6972 21.3761C15.6969 20.9638 16.0367 20.6325 16.4488 20.6432C16.8456 20.6536 17.162 20.9781 17.1623 21.375C17.1626 21.772 16.8466 22.097 16.4498 22.1078ZM24.8136 17.6999L26.2782 15.1679C26.3512 15.0233 26.2986 14.8469 26.1584 14.766C26.0182 14.6851 25.8391 14.7277 25.7505 14.8632L24.2666 17.4282C23.1327 16.9115 21.8588 16.6236 20.4993 16.6236C19.1407 16.6236 17.8669 16.912 16.7325 17.4282L15.2501 14.8632C15.1611 14.729 14.9831 14.6871 14.8435 14.7675C14.7039 14.848 14.6509 15.023 14.7224 15.1673L16.187 17.7005C13.6721 19.0663 11.9521 21.8832 11.7002 25.4361C13.3502 26.1695 16.2835 26.5361 20.5002 26.5361C24.7169 26.5361 27.6503 26.1695 29.3005 25.4361C29.0486 21.8832 27.3285 19.0663 24.8136 17.6999Z" fill="currentColor" fillOpacity="0.5"/>
    </g>
    </svg>
  );
}

function ChromiumIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.5 20.5C0.5 9.45431 9.45431 0.5 20.5 0.5V0.5C31.5457 0.5 40.5 9.45431 40.5 20.5V20.5C40.5 31.5457 31.5457 40.5 20.5 40.5V40.5C9.45431 40.5 0.5 31.5457 0.5 20.5V20.5Z" stroke="currentColor" strokeOpacity="0.1"/>
    <g clipPath="url(#chromium-clip0_4942_15754)">
    <path d="M29.0883 17.8167C29.4059 18.8314 29.543 19.8984 29.4877 20.968C29.4065 22.5397 28.9137 24.0629 28.06 25.385C27.2064 26.7069 26.0213 27.7824 24.6225 28.5032C23.3821 29.1422 22.0111 29.4817 20.6206 29.5003L24.4477 22.7356C24.8252 22.0771 25.0424 21.3146 25.0425 20.5012C25.0424 19.4951 24.7117 18.5661 24.1538 17.8167H29.0883ZM16.6431 22.7483C17.421 24.095 18.8758 25.0021 20.5425 25.0022C20.7549 25.0022 20.9639 24.9858 21.1684 24.9573L18.7261 29.3245C17.6359 29.1058 16.5912 28.6876 15.648 28.0842C14.3177 27.2331 13.235 26.046 12.5083 24.6438C11.7817 23.2414 11.4365 21.6719 11.5083 20.094C11.5725 18.6857 11.9659 17.3138 12.6548 16.0891L16.6431 22.7483ZM20.4995 17.5305C22.1398 17.5306 23.469 18.86 23.4692 20.5003C23.4692 22.1406 22.1399 23.4709 20.4995 23.471C18.8591 23.471 17.5288 22.1407 17.5288 20.5003C17.529 18.86 18.8592 17.5305 20.4995 17.5305ZM20.9438 11.511C22.5281 11.5896 24.0642 12.0854 25.395 12.9485C26.5948 13.7267 27.5889 14.7724 28.2993 16.0086H20.5425C18.637 16.0086 17.0076 17.1858 16.3511 18.8587L13.7241 14.5774C14.466 13.7286 15.3631 13.0227 16.3716 12.5022C17.7813 11.7749 19.3595 11.4325 20.9438 11.511Z" fill="currentColor" fillOpacity="0.5"/>
    </g>
    <defs>
    <clipPath id="chromium-clip0_4942_15754">
    <rect width="18" height="18" fill="white" transform="translate(11.5 11.5)"/>
    </clipPath>
    </defs>
    </svg>
  );
}

interface Platform {
  icon: React.FC<{ className?: string }>;
  name: string;
  version: string;
  hasDownload: boolean;
  downloads: DownloadItem[];
  docHref?: string;
  docLabel?: string;
  actionLabel?: string;
}

const platforms: Platform[] = [
  {
    icon: WinIcon,
    name: "WINDOWS 10 20H2+",
    version: "V1.5.5",
    hasDownload: true,
    downloads: [
      { label: "Windows", href: "https://www.123pan.com/s/astrobox-win", password: "abxw" },
    ],
    docHref: "/docs/usage",
    docLabel: "查看 Windows 使用教程",
  },
  {
    icon: MacIcon,
    name: "MACOS SONOMA (14)+",
    version: "V1.5.5",
    hasDownload: true,
    downloads: [
      { label: "macOS", href: "https://www.123pan.com/s/astrobox-mac", password: "abxm" },
    ],
    docHref: "/docs/usage",
    docLabel: "查看 macOS 使用教程",
  },
  {
    icon: LinuxIcon,
    name: "DEBIAN/REDHAT",
    version: "V1.5.5",
    hasDownload: true,
    downloads: [
      { label: "Debian (.deb)", href: "https://www.123pan.com/s/astrobox-deb", password: "abxd" },
      { label: "RedHat (.rpm)", href: "https://www.123pan.com/s/astrobox-rpm", password: "abxr" },
    ],
    docHref: "/docs/usage",
    docLabel: "查看 Linux 使用教程",
  },
  {
    icon: IosIcon,
    name: "IOS/IPADOS 14+",
    version: "V1.5.5",
    hasDownload: true,
    downloads: [
      { label: "iOS / iPadOS", href: "https://apps.apple.com/app/astrobox" },
    ],
    docHref: "/docs/usage",
    docLabel: "查看 iOS 使用教程",
  },
  {
    icon: AndroidIcon,
    name: "Android 10+",
    version: "V1.5.5",
    hasDownload: true,
    downloads: [
      { label: "Android", href: "https://www.123pan.com/s/astrobox-android", password: "abxa" },
    ],
    docHref: "/docs/usage",
    docLabel: "查看 Android 使用教程",
  },
  {
    icon: ChromiumIcon,
    name: "CHROMIUM 117+",
    version: "V1.5.5",
    hasDownload: true,
    actionLabel: "前往",
    downloads: [
      { label: "Chromium", href: "https://chrome.google.com/webstore/detail/astrobox", linkLabel: "链接" },
    ],
    docHref: "/docs/usage",
    docLabel: "查看 Chromium 使用教程",
  },
];

export function DownloadCards() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [deviceListOpen, setDeviceListOpen] = useState(true);

  const handleDownloadClick = (platform: Platform) => {
    if (!platform.hasDownload) return;
    setActivePlatform(platform);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    setDialogOpen(false);
    setPostDialogOpen(true);
  };

  return (
    <section
      className="mx-auto w-full max-w-4xl"
      style={{ fontFamily: "'Maple Mono', 'MiSans', monospace" }}
    >
      <div className="mb-10 text-center">
        <h2
          className="text-3xl font-bold tracking-wide text-fd-foreground md:text-4xl"
        >
          快速开始
        </h2>
        <p className="mt-4 text-sm text-fd-muted-foreground md:text-base">
          从下载最新版 AstroBox 开始
        </p>
      </div>

      {/* 设备兼容性提示 */}
      <div className="mx-2.5 mb-8 rounded-2xl border border-fd-border/60 bg-fd-background p-5 md:p-6">
        <button
          onClick={() => setDeviceListOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex shrink-0 items-center justify-center rounded-xl bg-fd-primary/10 p-2.5 text-fd-primary">
              <Watch className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-fd-foreground">
                下载前，先确认你的设备是否受支持
              </h3>
              <p className="text-sm text-fd-muted-foreground">
                AstroBox 支持多种主流穿戴设备，但不同型号的功能适配情况可能存在差异。
              </p>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-foreground">
            {deviceListOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </div>
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${deviceListOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden">
            <div className="mt-4 overflow-hidden rounded-xl border border-fd-border/60">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="hidden bg-fd-accent/50 sm:table-row">
                    <th className="px-4 py-2.5 font-medium text-fd-foreground">型号</th>
                    <th className="px-4 py-2.5 font-medium text-fd-foreground">状态</th>
                    <th className="hidden px-4 py-2.5 font-medium text-fd-foreground md:table-cell">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fd-border/60">
                  {[
                    { name: "小米手环 9 Pro", status: "supported" as const, note: "—" },
                    { name: "小米手环 10 系列", status: "supported" as const, note: "—" },
                    { name: "小米手环 9 系列", status: "supported" as const, note: "—" },
                    { name: "小米手环 8 系列", status: "unsupported" as const, note: "过时设备" },
                    { name: "REDMI Watch 6", status: "supported" as const, note: "—" },
                    { name: "REDMI Watch 5 eSIM", status: "supported" as const, note: "—" },
                    { name: "REDMI Watch 5", status: "supported" as const, note: "—" },
                    { name: "REDMI Watch 4 及更老机型", status: "unsupported" as const, note: "过时设备" },
                    { name: "小米 Watch S4", status: "supported" as const, note: "—" },
                    { name: "小米 Watch S3", status: "supported" as const, note: "—" },
                    { name: "小米 Watch S2 及更老机型", status: "unsupported" as const, note: "协议版本不支持" },
                    { name: "REDMI 手环 / Active 系列", status: "unsupported" as const, note: "协议版本不支持" },
                  ].map((device) => (
                    <tr key={device.name} className="block transition-colors hover:bg-fd-accent/30 sm:table-row">
                      <td className="block px-4 pt-4 pb-1 text-fd-foreground sm:table-cell sm:py-2.5">{device.name}</td>
                      <td className="block px-4 pt-1 pb-4 sm:table-cell sm:py-2.5">
                        {device.status === "supported" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-green-600 dark:text-green-400">
                            <CheckCircle2 className="size-3" />
                            完整支持
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-fd-muted/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-fd-muted-foreground">
                            <XCircle className="size-3" />
                            不支持
                          </span>
                        )}
                      </td>
                      <td className="hidden px-4 py-2.5 text-fd-muted-foreground md:table-cell">{device.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-fd-border/70 md:grid-cols-3">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              className="group relative flex flex-col items-center justify-center bg-fd-background py-8 text-center transition-colors hover:bg-fd-accent/30"
            >
              <div className="mb-4 inline-flex items-center justify-center text-fd-muted-foreground transition-colors group-hover:text-fd-primary">
                <Icon className="size-10" />
              </div>
              <span className="text-sm tracking-wide text-fd-muted-foreground">
                {p.name}
              </span>
              {p.version && (
                <span className="mt-1 text-xs tracking-wide text-fd-muted-foreground/70">
                  {p.version}
                </span>
              )}
              {p.hasDownload && (
                <button
                  onClick={() => handleDownloadClick(p)}
                  className="mt-2 inline-flex items-center text-sm tracking-wide text-fd-foreground transition-colors hover:text-fd-primary"
                >
                  {p.actionLabel ?? "下载"}
                  <ChevronRight className="ml-0.5 size-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <DownloadDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="即将离开 AstroBox 文档"
        description="目标页面由第三方提供，请确认链接地址后再继续访问。"
        downloads={activePlatform?.downloads}
        onConfirm={handleConfirm}
      />

      <PostDownloadDialog
        isOpen={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        docHref={activePlatform?.docHref}
        docLabel={activePlatform?.docLabel}
      />
    </section>
  );
}
