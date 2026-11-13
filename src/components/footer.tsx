import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-fd-border/50 bg-fd-background/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:items-end md:justify-between md:py-12">
        {/* 左侧：Logo + 版权信息 */}
        <div className="flex flex-col items-center gap-4 md:items-start">
          <div className="inline-flex items-center">
            <span
              aria-hidden="true"
              className="h-7 w-[190px] shrink-0 bg-fd-foreground"
              style={{
                WebkitMask: "url('/assets/brand/teamlogo.svg') center / contain no-repeat",
                mask: "url('/assets/brand/teamlogo.svg') center / contain no-repeat",
              }}
            />
          </div>

          <div className="flex flex-col items-center gap-1 text-xs text-fd-muted-foreground md:items-start">
            <p>版权所有 2026</p>
            <p>
              文档内容遵循{" "}
              <Link
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-fd-primary"
              >
                CC BY-NC-SA 4.0
              </Link>{" "}
              协议共享
            </p>
            {process.env.NEXT_PUBLIC_BUILD_TIME && (
              <p className="mt-1 text-fd-muted-foreground/60">
                构建于 {" "}
                {new Date(process.env.NEXT_PUBLIC_BUILD_TIME).toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-xs text-fd-muted-foreground/70 md:items-end">
          <a
            href="https://qm.qq.com/q/AL8Js6khKq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-fd-muted-foreground"
          >
            <span>QQ 群: 1102457938</span>
          </a>

          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-fd-muted-foreground"
          >
            {/* <span className="inline-block size-3.5 rounded-sm border border-current opacity-50" /> */}
            <span>闽ICP备2024035715号-2</span>
          </a>

          {/* <a
            href="http://www.beian.gov.cn/portal/registerSystemInfo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-fd-muted-foreground"
          >
            <span className="inline-block size-3.5 rounded-sm border border-current opacity-50" />
            <span>京公网安备 XXXXXXXXXXXX号</span>
          </a> */}
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-fd-primary/20 to-transparent" />
    </footer>
  );
}
