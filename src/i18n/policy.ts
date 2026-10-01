import type { Lang } from "@/data/types";

/**
 * Phiên bản của chính sách và điều khoản, theo ngày có hiệu lực.
 *
 * Mẫu tạo tài khoản gửi giá trị này lên Supabase; trigger trong
 * `supabase/migrations` ghi nó vào bảng `consents` làm bằng chứng người dùng đã
 * đồng ý đúng bản nào. Sửa nội dung dưới đây theo hướng thay đổi quyền hay nghĩa
 * vụ của người dùng thì phải đổi ngày này.
 */
export const POLICY_VERSION = "2026-10-03";

export interface PolicySection {
  /** Neo trên trang, cũng là đích của liên kết từ chân trang và mẫu đăng ký. */
  id: "rieng-tu" | "dieu-khoan" | "ban-quyen";
  h: string;
  parts: { h: string; p: string[] }[];
}

export interface PolicyCopy {
  eyebrow: string;
  title: string;
  lede: string;
  version: string;
  toc: string;
  sections: PolicySection[];
}

const vi: PolicyCopy = {
  eyebrow: "Pháp lý",
  title: "Chính sách và điều khoản",
  lede: "Trang lưu gì về bạn, bạn có quyền gì với dữ liệu đó, được dùng trang và dữ liệu của trang ra sao. Viết ngắn và cụ thể để đọc hết được.",
  version: "Phiên bản có hiệu lực từ",
  toc: "Mục lục",
  sections: [
    {
      id: "rieng-tu",
      h: "Chính sách quyền riêng tư",
      parts: [
        {
          h: "Bên kiểm soát dữ liệu",
          p: [
            "Ông Nguyễn Thành Long, chủ sở hữu Lex & Lineage, quyết định mục đích và cách xử lý dữ liệu cá nhân trên trang. Liên hệ: longnt284.lawyer@gmail.com, điện thoại 0941 563 789.",
            "Chính sách này áp dụng Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và các văn bản hướng dẫn.",
          ],
        },
        {
          h: "Khi không có tài khoản",
          p: [
            "Trang không dùng cookie theo dõi, không nạp mã quảng cáo hay đo lường của bên thứ ba. Văn bản đang theo dõi, bộ hồ sơ, văn bản vừa xem và câu tìm gần đây chỉ nằm trong bộ nhớ của trình duyệt bạn đang dùng, không gửi đi đâu.",
            "Như mọi máy chủ web, nhà cung cấp hạ tầng Vercel ghi nhật ký kỹ thuật của các lượt truy cập (thời điểm, địa chỉ IP, đường dẫn) để vận hành và bảo vệ trang.",
          ],
        },
        {
          h: "Khi có tài khoản",
          p: [
            "Dữ liệu được lưu: email; mật khẩu dưới dạng đã băm (không ai đọc lại được mật khẩu gốc); danh sách văn bản theo dõi kèm ngày bắt đầu theo dõi; bộ hồ sơ (tên và mã văn bản); phiên bản chính sách bạn đã đồng ý và thời điểm đồng ý. Supabase ghi thêm nhật ký các lần đăng nhập (thời điểm, địa chỉ IP) để bảo mật.",
            "Mục đích: cho bạn đăng nhập, giữ danh sách theo dõi và bộ hồ sơ đi theo bạn trên mọi máy, phát hiện và chặn lạm dụng, lưu bằng chứng đồng ý. Dữ liệu không được bán, không dùng cho quảng cáo, không chia sẻ cho ai ngoài hai nhà cung cấp dưới đây.",
            "Cơ sở xử lý: sự đồng ý của bạn khi tạo tài khoản.",
          ],
        },
        {
          h: "Nơi lưu và bên xử lý",
          p: [
            "Tài khoản lưu trên Supabase, máy chủ đặt tại Seoul, Hàn Quốc. Vì vậy dữ liệu tài khoản được chuyển ra ngoài lãnh thổ Việt Nam; bạn đồng ý với việc này khi tạo tài khoản. Trang được lưu trữ và phân phối qua Vercel.",
            "Mỗi người chỉ đọc, ghi được dữ liệu của chính mình: cơ sở dữ liệu tự kiểm tra điều này ở từng hàng (Row Level Security). Kết nối luôn mã hóa qua HTTPS.",
          ],
        },
        {
          h: "Thời hạn lưu",
          p: [
            "Dữ liệu tài khoản được giữ đến khi bạn xóa tài khoản. Xóa tài khoản là xóa ngay email, mật khẩu đã băm, danh sách theo dõi, bộ hồ sơ và bằng chứng đồng ý khỏi cơ sở dữ liệu. Bản sao lưu kỹ thuật của nhà cung cấp, nếu có, tự xóa theo chu kỳ của họ.",
          ],
        },
        {
          h: "Quyền của bạn",
          p: [
            "Bạn có quyền được biết, đồng ý hoặc không đồng ý, truy cập, chỉnh sửa, xóa dữ liệu và rút lại sự đồng ý. Trên trang: tải toàn bộ dữ liệu tài khoản dưới dạng tệp JSON và xóa vĩnh viễn tài khoản ở trang Tài khoản; sửa danh sách theo dõi, bộ hồ sơ ngay trên trang Theo dõi. Rút lại sự đồng ý nghĩa là xóa tài khoản; các công cụ vẫn dùng được mà không cần đăng nhập.",
            "Với các yêu cầu khác, hoặc nếu bạn cho rằng dữ liệu của mình bị xử lý sai, hãy gửi email tới địa chỉ liên hệ ở trên. Chúng tôi trả lời trong thời hạn pháp luật quy định.",
          ],
        },
        {
          h: "Góp ý dữ liệu",
          p: [
            "Mẫu góp ý mở ứng dụng email của bạn với nội dung soạn sẵn. Trang không lưu nội dung bạn nhập; chỉ người nhận email đọc được.",
          ],
        },
        {
          h: "Trợ lý hỏi đáp",
          p: [
            "Khi bạn bấm gửi, câu hỏi cùng các lượt trước của cuộc trò chuyện đi qua máy chủ của trang tới nhà cung cấp mô hình ngôn ngữ để tạo câu trả lời: Google (Gemini API), hoặc OpenRouter khi bạn chọn một model của OpenRouter hay khi Google không nhận yêu cầu; OpenRouter chuyển yêu cầu tới nhà phát triển của model đó. Máy chủ của các nhà cung cấp này đặt ngoài Việt Nam, nên nội dung bạn gửi được chuyển ra nước ngoài.",
            "Trang dùng gói miễn phí của các nhà cung cấp này. Theo điều khoản của họ, nội dung gửi qua gói miễn phí có thể được dùng để cải thiện sản phẩm và mô hình, và có thể được người của nhà cung cấp đọc. Vì vậy, đừng nhập họ tên, số giấy tờ, thông tin liên hệ hay chi tiết bí mật của vụ việc.",
            "Máy chủ của trang không lưu cuộc trò chuyện. Lịch sử tối đa 5 cuộc gần nhất được lưu trong bộ nhớ của trình duyệt bạn đang dùng, không gửi lên máy chủ; bạn xóa được từng cuộc hoặc toàn bộ trong mục Lịch sử của khung chat, hoặc bằng cách xóa dữ liệu trang trong trình duyệt. Trên máy dùng chung, hãy xóa lịch sử sau khi dùng.",
            "Để giới hạn số lượt hỏi, trình duyệt gửi kèm mỗi câu hỏi một mã thiết bị ngẫu nhiên, không gắn với danh tính của bạn; máy chủ giữ mã đó, địa chỉ IP và thời điểm hỏi trong bộ nhớ tối đa 24 giờ. Với mỗi câu trả lời, máy chủ ghi nhật ký số liệu kỹ thuật (model trả lời, số ký tự, số token, thời gian xử lý), không ghi nội dung câu hỏi hay câu trả lời. Vercel ghi nhật ký kỹ thuật của lượt gửi như mọi lượt truy cập khác.",
            "Cơ sở xử lý: sự đồng ý của bạn khi bấm gửi, sau khi đã đọc thông báo in ngay trong khung trò chuyện. Không đồng ý thì đừng dùng trợ lý; mọi công cụ khác của trang vẫn dùng được.",
          ],
        },
        {
          h: "Thay đổi chính sách",
          p: [
            "Khi chính sách đổi theo hướng ảnh hưởng tới quyền của bạn, ngày phiên bản ở đầu trang sẽ đổi và thay đổi được nêu rõ trên trang này.",
          ],
        },
      ],
    },
    {
      id: "dieu-khoan",
      h: "Điều khoản sử dụng",
      parts: [
        {
          h: "Tính chất của trang",
          p: [
            "Lex & Lineage là công cụ tra cứu dành cho pháp chế doanh nghiệp và luật sư. Nội dung chỉ để tham khảo: không phải ý kiến pháp lý, không thay thế tư vấn cho một vụ việc cụ thể và không tạo lập quan hệ luật sư với khách hàng. Trước khi viện dẫn trong hợp đồng, ý kiến pháp lý hay hồ sơ gửi cơ quan nhà nước, hãy đối chiếu nguyên văn trên Công báo, Cơ sở dữ liệu quốc gia về pháp luật hoặc với cơ quan ban hành.",
            "Trang miễn phí và được cung cấp nguyên trạng. Nội dung, tính năng có thể thay đổi hoặc tạm ngừng mà không báo trước.",
          ],
        },
        {
          h: "Trợ lý hỏi đáp",
          p: [
            "Câu trả lời của trợ lý do mô hình ngôn ngữ tạo tự động, dựa trên phương pháp phân tích của chủ sở hữu và kho văn bản của trang. Câu trả lời có thể sai, thiếu hoặc lỗi thời; nó không phải ý kiến pháp lý và không tạo lập quan hệ luật sư với khách hàng. Trợ lý có thể tạm ngưng khi hết hạn mức miễn phí.",
            "Không dùng trợ lý để gửi nội dung vi phạm pháp luật, và không tìm cách moi chỉ dẫn nội bộ của trợ lý.",
          ],
        },
        {
          h: "Tài khoản",
          p: [
            "Bạn tự giữ bí mật mật khẩu và chịu trách nhiệm về hoạt động trong tài khoản của mình. Tài khoản dùng để lạm dụng hệ thống có thể bị khóa.",
          ],
        },
        {
          h: "Những việc không được làm",
          p: [
            "Thu thập tự động hàng loạt nội dung hay dữ liệu của trang để sao chép tập dữ liệu hoặc dựng sản phẩm cạnh tranh. Công cụ tìm kiếm lập chỉ mục theo robots.txt thì được phép.",
            "Vượt qua hoặc dò tìm lỗ hổng của biện pháp bảo mật khi chưa được phép (lỗ hổng tìm thấy xin báo theo SECURITY.md của kho mã); gửi lượng yêu cầu làm quá tải hệ thống; mạo danh người khác.",
          ],
        },
        {
          h: "Nguồn dữ liệu công khai",
          p: [
            "Tệp /api/v1/documents.json được dùng để tham khảo và tích hợp, với điều kiện ghi rõ nguồn \"Lex & Lineage\" kèm đường dẫn tới trang. Không bán lại, không trình bày như dữ liệu của mình. Cấu trúc tệp đổi theo quy tắc phiên bản ghi trong trường schema.",
          ],
        },
        {
          h: "Giới hạn trách nhiệm",
          p: [
            "Trong phạm vi pháp luật cho phép, chủ sở hữu không chịu trách nhiệm về thiệt hại phát sinh từ việc dựa vào nội dung của trang mà không đối chiếu với văn bản gốc.",
          ],
        },
        {
          h: "Luật áp dụng",
          p: [
            "Điều khoản này theo pháp luật Việt Nam. Tranh chấp được giải quyết tại Tòa án có thẩm quyền của Việt Nam.",
          ],
        },
      ],
    },
    {
      id: "ban-quyen",
      h: "Bản quyền",
      parts: [
        {
          h: "Thuộc về ai",
          p: [
            "Mã nguồn, sưu tập văn bản đã được tuyển chọn và xác minh, bản dịch tiếng Anh, phần giải thích và đối chiếu, thiết kế giao diện, hình minh họa và video của Lex & Lineage thuộc quyền tác giả của ông Nguyễn Thành Long. Bảo lưu mọi quyền.",
            "Mã nguồn công khai trên GitHub để xem, không phải giấy phép mã nguồn mở. Sao chép, sửa đổi, phân phối hay triển khai lại cần văn bản đồng ý; điều kiện đầy đủ ở tệp LICENSE của kho mã.",
          ],
        },
        {
          h: "Những gì ai cũng dùng được",
          p: [
            "Văn bản quy phạm pháp luật và văn bản hành chính không thuộc phạm vi bảo hộ quyền tác giả (khoản 2 Điều 15 Luật Sở hữu trí tuệ). Bạn luôn dùng được nguyên văn các văn bản đó từ nguồn chính thức.",
          ],
        },
        {
          h: "Xin phép sử dụng",
          p: ["Gửi email tới longnt284.lawyer@gmail.com, nêu rõ phần muốn dùng và mục đích."],
        },
      ],
    },
  ],
};

const en: PolicyCopy = {
  eyebrow: "Legal",
  title: "Policies and terms",
  lede: "What the site keeps about you, what rights you have over it, and how you may use the site and its data. Short and specific so it can be read in full.",
  version: "Version in force from",
  toc: "Contents",
  sections: [
    {
      id: "rieng-tu",
      h: "Privacy policy",
      parts: [
        {
          h: "Data controller",
          p: [
            "Mr Nguyễn Thành Long, owner of Lex & Lineage, decides why and how personal data on the site is processed. Contact: longnt284.lawyer@gmail.com, phone +84 941 563 789.",
            "This policy applies the Law on Personal Data Protection No. 91/2025/QH15 of Vietnam and its implementing regulations.",
          ],
        },
        {
          h: "Without an account",
          p: [
            "The site uses no tracking cookies and loads no third-party advertising or analytics code. Followed instruments, matters, recently viewed instruments and recent searches stay in your own browser and are not sent anywhere.",
            "Like any web server, the hosting provider Vercel keeps technical access logs (time, IP address, path) to run and protect the site.",
          ],
        },
        {
          h: "With an account",
          p: [
            "What is stored: your email; your password in hashed form (nobody can read the original back); your watchlist with the date you started following each instrument; your matters (name and instrument codes); the policy version you accepted and when. Supabase also logs sign-ins (time, IP address) for security.",
            "Purposes: letting you sign in, keeping your watchlist and matters across devices, detecting and stopping abuse, and keeping proof of consent. The data is not sold, not used for advertising, and not shared with anyone other than the two providers below.",
            "Legal basis: your consent when you create the account.",
          ],
        },
        {
          h: "Where it is stored and who processes it",
          p: [
            "Accounts are stored on Supabase, on servers in Seoul, South Korea. Account data is therefore transferred outside Vietnam; you agree to this when you create an account. The site itself is hosted and delivered by Vercel.",
            "Each person can read and write only their own data: the database checks this on every row (Row Level Security). Connections are always encrypted over HTTPS.",
          ],
        },
        {
          h: "How long it is kept",
          p: [
            "Account data is kept until you delete the account. Deleting the account immediately removes your email, hashed password, watchlist, matters and consent record from the database. Providers' technical backups, where they exist, expire on their own schedule.",
          ],
        },
        {
          h: "Your rights",
          p: [
            "You have the right to be informed, to give or refuse consent, to access, correct and delete your data, and to withdraw consent. On the site: download all your account data as a JSON file and permanently delete the account from the Account page; edit your watchlist and matters on the Watchlist page. Withdrawing consent means deleting the account; every tool still works without signing in.",
            "For any other request, or if you believe your data is being processed wrongly, email the contact address above. We reply within the time limits set by law.",
          ],
        },
        {
          h: "Data feedback",
          p: [
            "The feedback form opens your own email app with a prepared message. The site keeps no copy of what you type; only the recipient of the email reads it.",
          ],
        },
        {
          h: "Q&A assistant",
          p: [
            "When you press send, your question and the earlier turns of the conversation pass through the site's server to a language-model provider that writes the answer: Google (Gemini API), or OpenRouter when you pick an OpenRouter model or when Google does not accept the request; OpenRouter passes the request to that model's developer. These providers' servers are outside Vietnam, so what you send is transferred abroad.",
            "The site uses these providers' free tiers. Under their terms, content sent through a free tier may be used to improve their products and models and may be read by the provider's staff. Do not enter names, ID numbers, contact details or confidential details of a matter.",
            "The site's server does not store conversations. The history of your last 5 chats is kept in the storage of the browser you are using and is never sent to the server; you can delete one chat or all of them under History in the chat panel, or by clearing the site's data in your browser. On a shared computer, clear the history when you are done.",
            "To limit the number of questions, the browser sends a random device code with each question, not linked to your identity; the server keeps that code, your IP address and the time of each question in memory for at most 24 hours. For each answer the server logs technical figures (the model that answered, character and token counts, processing time), never the text of the question or the answer. Vercel logs the request like any other visit.",
            "Legal basis: your consent when you press send, after reading the notice shown in the chat panel. If you do not agree, do not use the assistant; every other tool on the site still works.",
          ],
        },
        {
          h: "Changes to this policy",
          p: [
            "When the policy changes in a way that affects your rights, the version date at the top of this page changes and the change is described here.",
          ],
        },
      ],
    },
    {
      id: "dieu-khoan",
      h: "Terms of use",
      parts: [
        {
          h: "What the site is",
          p: [
            "Lex & Lineage is a research tool for in-house counsel and lawyers. Its content is for reference only: it is not legal advice, does not replace advice on a specific matter, and creates no lawyer–client relationship. Before citing anything in a contract, legal opinion or filing with a state authority, check the original text in the Official Gazette, the National Legal Database or with the issuing body.",
            "The site is free and provided as is. Content and features may change or be suspended without notice.",
          ],
        },
        {
          h: "Q&A assistant",
          p: [
            "The assistant's answers are generated automatically by a language model, using the owner's analytical method and the site's dataset. They may be wrong, incomplete or out of date; they are not legal advice and create no lawyer–client relationship. The assistant may pause when the free quota runs out.",
            "Do not use the assistant to send unlawful content, and do not try to extract its internal instructions.",
          ],
        },
        {
          h: "Accounts",
          p: [
            "You keep your password secret and are responsible for activity in your account. Accounts used to abuse the system may be suspended.",
          ],
        },
        {
          h: "What you may not do",
          p: [
            "Bulk automated collection of the site's content or data in order to copy the dataset or build a competing product. Search engines indexing under robots.txt are welcome.",
            "Bypassing or probing security measures without permission (please report vulnerabilities under the repository's SECURITY.md); sending traffic that overloads the system; impersonating others.",
          ],
        },
        {
          h: "Public data feed",
          p: [
            "The /api/v1/documents.json file may be used for reference and integration, provided the source \"Lex & Lineage\" is clearly credited with a link to the site. Do not resell it or present it as your own data. The file's structure changes according to the versioning rule stated in its schema field.",
          ],
        },
        {
          h: "Limitation of liability",
          p: [
            "To the extent permitted by law, the owner is not liable for loss arising from reliance on the site's content without checking the original instrument.",
          ],
        },
        {
          h: "Governing law",
          p: [
            "These terms are governed by the law of Vietnam. Disputes are resolved by the competent courts of Vietnam.",
          ],
        },
      ],
    },
    {
      id: "ban-quyen",
      h: "Copyright",
      parts: [
        {
          h: "Who owns it",
          p: [
            "The source code, the selected and verified compilation of instruments, the English translations, the explanations and comparisons, the interface design, illustrations and video of Lex & Lineage are the copyright of Mr Nguyễn Thành Long. All rights reserved.",
            "The source code is public on GitHub for viewing; it is not an open-source licence. Copying, modifying, distributing or redeploying it requires written consent; the full terms are in the repository's LICENSE file.",
          ],
        },
        {
          h: "What anyone may use",
          p: [
            "Legal normative documents and administrative documents are not subject to copyright (Article 15(2) of the Law on Intellectual Property). You can always use their original text from official sources.",
          ],
        },
        {
          h: "Permission requests",
          p: ["Email longnt284.lawyer@gmail.com stating which part you want to use and for what purpose."],
        },
      ],
    },
  ],
};

export const policyCopy: Record<Lang, PolicyCopy> = { vi, en };

export function getPolicy(lang: Lang): PolicyCopy {
  return policyCopy[lang];
}
