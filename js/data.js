/* AIGC 群島：課程內容資料。老師修改課程時只需要改這個檔案。 */
window.AIGC = {
  course: {
    name: "人工智慧生成內容應用",
    en: "APPLICATIONS OF AI-GENERATED CONTENT",
    audience: "室內設計系碩士班",
    credits: "3 學分",
    hours: "每週 3 小時（講授 1 小時、實作 2 小時）",
    teacher: "任課教師",
    summary: "以室內設計的真實工作流程為主軸：從設計研究、概念發想、圖面渲染、材質與 3D，到提案簡報，學習把生成式 AI 放進自己的設計方法裡，並能判斷它何時可信、何時不可信。",
    grading: [
      { item: "出席與課堂參與", weight: 20 },
      { item: "每週實作作業", weight: 30 },
      { item: "期中：AI 概念情緒板提案", weight: 20 },
      { item: "期末：AI 輔助室內設計提案", weight: 30 }
    ]
  },

  resources: {
    prompt: { name: "詞穗", hint: "提示詞與大型語言模型", color: "#c9a54c", ink: "#6e5715" },
    image:  { name: "像素磚", hint: "影像生成", color: "#c2602f", ink: "#9e4a20" },
    model:  { name: "模型木", hint: "3D 與空間", color: "#4e7c74", ink: "#3f655e" },
    data:   { name: "數據礦", hint: "工作流與資料", color: "#6b7690", ink: "#4d566d" },
    ethics: { name: "思辨羊毛", hint: "倫理與批判", color: "#93ab72", ink: "#4f6638" }
  },

  units: [
    {
      week: 1, res: "ethics", num: 10, short: "課程導論",
      title: "課程導論：AIGC 與室內設計的未來",
      goals: ["說出生成式 AI 在室內設計流程中的主要切入點", "盤點自己目前的設計流程與痛點", "建立本學期的工具帳號與作品資料夾"],
      points: ["AIGC 的四種輸出：文字、影像、3D、影片", "設計流程地圖：研究 → 概念 → 發展 → 表現 → 提案", "案例觀察：事務所如何用 AI 做前期提案與業主溝通", "本學期評分方式與群島地圖玩法"],
      tools: ["ChatGPT / Claude / Gemini", "Midjourney", "Adobe Firefly"],
      practice: "畫出你上一個設計案的流程圖，標出三個最耗時的步驟，並寫下你猜 AI 能幫上忙的地方。",
      prompts: ["我是室內設計研究生，以下是我上一個住宅案的設計流程：［貼上流程］。請指出哪些步驟適合用生成式 AI 協助，哪些步驟不適合，並說明理由。"],
      homework: "繳交一頁「我的設計流程 × AI 機會地圖」（A3 PDF）。",
      checks: ["完成三種 AI 工具帳號註冊", "畫出個人設計流程圖", "標出三個 AI 可介入的步驟"],
      challenge: "用一句話向業主解釋：你為什麼在提案中使用 AI 生成圖？"
    },
    {
      week: 2, res: "data", num: 4, short: "生成原理",
      title: "生成式 AI 原理：擴散模型與大型語言模型",
      goals: ["用設計師聽得懂的方式說明擴散模型如何從雜訊生成影像", "理解 token、上下文、溫度等 LLM 概念", "知道模型為什麼會「幻覺」"],
      points: ["擴散模型：從雜訊逐步去噪，提示詞是方向不是指令", "潛在空間：風格與構圖如何被編碼", "LLM 的運作：預測下一個字，所以會自信地說錯", "種子值、步數、CFG 對結果的影響"],
      tools: ["Stable Diffusion WebUI / ComfyUI", "ChatGPT / Claude"],
      practice: "固定提示詞，只改種子值生成 6 張客廳圖；再固定種子值，只改 CFG，觀察差異並排版比較。",
      prompts: ["modern living room, warm oak floor, linen sofa, large window, afternoon light, architectural photography"],
      homework: "繳交「同提示詞、不同參數」比較表一張，附上你的觀察三點。",
      checks: ["能說明擴散模型的去噪過程", "完成種子值比較實驗", "完成 CFG 比較實驗"],
      challenge: "同一句提示詞換三個種子值，挑出最符合業主需求的一張並說明理由。"
    },
    {
      week: 3, res: "prompt", num: 9, short: "提示詞基礎",
      title: "提示詞工程基礎",
      goals: ["掌握角色、任務、脈絡、格式四段式提示詞", "能把模糊的設計需求改寫成可執行的提示詞", "建立個人提示詞筆記"],
      points: ["四段式結構：角色 / 任務 / 脈絡 / 輸出格式", "少樣本示範（few-shot）：給 AI 看你要的樣子", "逐步拆解：把大問題切成小問題", "迭代：從結果回推提示詞缺了什麼"],
      tools: ["ChatGPT / Claude / Gemini"],
      practice: "把「幫我設計一間舒服的咖啡廳」改寫成完整四段式提示詞，比較前後輸出品質。",
      prompts: ["你是有 15 年經驗的商業空間設計師。任務：為 30 坪、位於老公寓一樓的獨立咖啡廳提出 3 個平面配置方向。脈絡：座位 24 席、需外帶窗口、預算中等、業主喜歡自然材質。輸出：每個方向用表格列出分區、動線特色、優缺點。"],
      homework: "建立「提示詞筆記」至少 5 則，每則記錄原句、改寫後、結果差異。",
      checks: ["寫出一則完整四段式提示詞", "完成改寫前後比較", "建立個人提示詞筆記"],
      challenge: "把「我要北歐風的臥室」擴寫成一段至少包含 5 個具體條件的提示詞。"
    },
    {
      week: 4, res: "prompt", num: 3, short: "設計研究",
      title: "LLM 輔助設計研究：業主訪談、機能分析與設計說明",
      goals: ["用 LLM 準備業主訪談題綱與整理訪談逐字稿", "產出機能需求表與空間關係矩陣", "撰寫並校對設計說明文字"],
      points: ["訪談前：生成題綱與追問題", "訪談後：逐字稿 → 需求摘要 → 需求衝突清單", "機能分析：面積需求表、鄰接關係矩陣", "設計說明：先寫骨架，再請 AI 潤飾，最後自己核對事實"],
      tools: ["ChatGPT / Claude", "NotebookLM", "Excel / Google 試算表"],
      practice: "兩人一組模擬業主訪談 10 分鐘，把逐字稿交給 AI 整理成需求表，再人工檢查遺漏。",
      prompts: ["以下是住宅業主訪談逐字稿：［貼上］。請整理成表格：需求項目、使用者、頻率、空間需求、優先順序（高/中/低），並另外列出業主需求之間互相衝突的地方。"],
      homework: "繳交一份完整的需求表＋空間鄰接矩陣，並標出 AI 整理錯誤的地方。",
      checks: ["完成訪談題綱", "用 AI 整理逐字稿成需求表", "人工核對並標出錯誤"],
      challenge: "請 AI 為一位在家工作的插畫家，列出 8 題住宅訪談追問題。"
    },
    {
      week: 5, res: "image", num: 8, short: "文生圖入門",
      title: "文生圖入門：從文字到空間意象",
      goals: ["寫出能控制構圖、光線、視角的室內影像提示詞", "理解不同平台的風格差異", "建立第一組空間意象圖"],
      points: ["提示詞要素：空間類型 / 風格 / 材質 / 光線 / 鏡頭 / 構圖", "攝影語彙：廣角、一點透視、眼睛高度、黃金時段", "長寬比與用途：16:9 簡報、4:5 社群、3:2 圖面", "常見破圖：家具比例、透視錯誤、不合理的燈具"],
      tools: ["Midjourney", "Adobe Firefly", "Krea", "Leonardo"],
      practice: "同一個空間（玄關）用三個平台各生成 4 張，比較風格傾向與可控性。",
      prompts: ["entryway of a small Taipei apartment, terrazzo floor, built-in walnut shoe cabinet with integrated bench, warm indirect lighting, eye-level wide-angle shot, one-point perspective, editorial interior photography --ar 3:2"],
      homework: "繳交 12 張玄關意象圖拼版，並註明各平台的優缺點。",
      checks: ["掌握六大提示詞要素", "完成三平台比較", "能指出圖中的破圖處"],
      challenge: "生成一張「雨天午後的閱讀角落」，要求一點透視、眼睛高度。"
    },
    {
      week: 6, res: "prompt", num: 11, short: "風格語彙",
      title: "室內風格語彙與提示詞庫",
      goals: ["整理 10 種常見室內風格的關鍵材質、色彩與家具語彙", "建立可重複使用的提示詞模組", "避免風格標籤的刻板化"],
      points: ["風格不是一個字：把「日式」拆成材料、比例、光線、構造細節", "設計師與品牌名稱的使用界線", "提示詞模組化：空間 + 風格模組 + 光線模組 + 鏡頭模組", "以中文想法、英文輸出的雙語策略"],
      tools: ["ChatGPT / Claude", "Notion / Google 試算表", "Midjourney"],
      practice: "小組各認領兩種風格，整理成「風格卡」：材質、色票、家具、燈光、提示詞模組。",
      prompts: ["請把「侘寂風」拆解成可用於影像生成的英文提示詞語彙，分成：材質、色彩、家具、光線、構造細節五類，每類 6 個詞，並標出容易被誤用的詞。"],
      homework: "上傳兩張風格卡至班級共享提示詞庫。",
      checks: ["完成兩張風格卡", "風格卡附上實際生成範例", "提示詞模組可替換組合"],
      challenge: "只用材質與光線描述（不寫風格名稱），生成一間讓人聯想到京都町家的茶室。"
    },
    {
      week: 7, res: "image", num: 6, short: "圖生圖重繪",
      title: "圖生圖與局部重繪",
      goals: ["用圖生圖改變既有照片的風格與材質", "用局部重繪替換家具、材質與燈具", "用擴展畫布補足構圖"],
      points: ["重繪強度：0.3 保留結構、0.7 大幅改寫", "局部重繪（inpainting）：遮罩要比物件略大", "擴展畫布（outpainting）：補天花板與地坪", "現況照改造：老屋翻新提案的最快路徑"],
      tools: ["Adobe Photoshop 生成填色", "Stable Diffusion / ComfyUI", "Krea"],
      practice: "拍一張教室或自家現況照，完成三個改造版本：換地坪、換牆面、換整體風格。",
      prompts: ["replace the floor with light grey micro-cement, keep the existing furniture and window, soft daylight, realistic"],
      homework: "繳交現況照與三個改造版本的對照圖，標示重繪強度與遮罩範圍。",
      checks: ["完成圖生圖風格轉換", "完成局部重繪", "完成擴展畫布"],
      challenge: "把一張辦公室照片的燈具全部換成線性吊燈，其他保持不變。"
    },
    {
      week: 8, res: "image", num: 5, short: "草圖轉渲染",
      title: "ControlNet：草圖、線稿與深度圖轉渲染",
      goals: ["用手繪草圖或 CAD 線稿控制生成結果的構圖", "理解 Canny、Lineart、Depth、Segmentation 的差異", "讓透視與比例跟著你的設計走"],
      points: ["為什麼需要控制：純文字無法鎖定你的平面與透視", "線稿類：Canny / Lineart / Scribble", "空間類：Depth / Normal / MLSD 直線偵測", "控制強度與起訖步數的平衡"],
      tools: ["ComfyUI + ControlNet", "Krea 即時繪圖", "LookX / Veras"],
      practice: "畫一張客廳一點透視手繪草圖，分別用 Scribble 與 MLSD 生成，比較哪個更忠於原稿。",
      prompts: ["cozy living room, exact layout from sketch, plaster walls, oak timber ceiling beams, built-in bookshelf, late afternoon light, photorealistic interior render"],
      homework: "同一張草圖，產出 3 種材質方案的渲染圖，附上控制參數紀錄。",
      checks: ["能說明四種 ControlNet 差異", "完成草圖轉渲染", "記錄控制參數"],
      challenge: "用一張 5 分鐘速寫，生成一張透視不跑掉的臥室渲染。"
    },
    {
      week: 9, res: "prompt", num: 12, short: "期中情緒板",
      title: "期中：AI 概念情緒板提案",
      goals: ["整合前八週方法，為一個真實基地提出概念", "用情緒板傳達空間氛圍、材質與色彩策略", "能口頭說明 AI 在過程中扮演的角色"],
      points: ["基地：自選 20–40 坪住宅或商業空間", "內容：設計概念文字、6–9 張意象圖、材質色票、平面構想", "揭露：標示每張圖的生成工具與人工修改處", "評圖：每人 8 分鐘報告＋ 5 分鐘講評"],
      tools: ["前八週所有工具", "Adobe Express / Canva / InDesign"],
      practice: "以小組互評方式預演一次，針對「概念是否清楚、圖是否一致」互相給建議。",
      prompts: ["以下是我的設計概念草稿：［貼上］。請以評圖老師的角度提出 5 個尖銳但有建設性的問題。"],
      homework: "繳交期中情緒板（A1 直式 PDF）與 AI 使用揭露表。",
      checks: ["完成概念文字", "完成情緒板排版", "完成 AI 使用揭露表"],
      challenge: "用 50 字寫出你的期中設計概念，請 AI 挑錯後再改寫一次。"
    },
    {
      week: 10, res: "model", num: 2, short: "材質紋理",
      title: "材質與紋理生成（PBR）",
      goals: ["生成可無縫拼接的材質貼圖", "從單張貼圖產生法線、粗糙度、置換貼圖", "把 AI 材質放進渲染軟體"],
      points: ["無縫貼圖：tileable 提示詞與邊緣檢查", "PBR 通道：Base Color / Normal / Roughness / Displacement", "真實比例：一塊磁磚、一片木皮的實際尺寸", "AI 材質與真實建材型錄的對照"],
      tools: ["Adobe Substance 3D Sampler", "Polycam / Materialize", "D5 Render / Enscape / V-Ray"],
      practice: "生成三種在地材質（洗石子、磨石子、檜木）並轉成 PBR 貼圖組。",
      prompts: ["seamless tileable texture, Taiwanese washed granite finish, small pebbles, top-down flat view, even lighting, no shadows, 4k"],
      homework: "繳交三組 PBR 貼圖，並在渲染軟體中套用於同一場景比較。",
      checks: ["生成無縫材質", "轉出 PBR 通道", "在渲染軟體中測試"],
      challenge: "生成一張可無縫拼接的「復古馬賽克磁磚」貼圖，並檢查四邊接縫。"
    },
    {
      week: 11, res: "data", num: 9, short: "LoRA 風格",
      title: "LoRA 微調與個人設計風格",
      goals: ["理解 LoRA 是什麼、何時值得訓練", "準備一組乾淨的訓練資料", "訓練並測試一個個人作品風格模型"],
      points: ["資料集：20–40 張、主題一致、解析度足夠", "標註（captioning）：描述要和你想控制的東西對應", "過擬合的徵兆：每張圖都長一樣", "著作權：只用你有權使用的圖片訓練"],
      tools: ["ComfyUI", "Kohya_ss", "Civitai / Replicate 線上訓練"],
      practice: "整理自己過去作品照或模型照 20 張，完成標註並訓練一個 LoRA。",
      prompts: ["photo of an interior in mystyle, sunlit atelier, exposed concrete ceiling, plywood furniture"],
      homework: "繳交訓練資料集說明、LoRA 測試圖 8 張，以及權重強度比較。",
      checks: ["整理訓練資料集", "完成影像標註", "完成 LoRA 訓練與測試"],
      challenge: "說明你的 LoRA 權重設為 0.4 與 1.0 時，結果差在哪裡。"
    },
    {
      week: 12, res: "model", num: 4, short: "模型渲染",
      title: "SketchUp／Rhino 模型 + AI 渲染工作流",
      goals: ["把自己的 3D 模型直接送進 AI 渲染", "在保留設計的前提下快速比較多個材質方案", "建立「建模 → AI 渲染 → 修正」的迭代循環"],
      points: ["白模輸出：線稿、深度、分割遮罩", "外掛工作流：在建模軟體內即時 AI 渲染", "一致性：同一案子不同視角維持同樣材質", "什麼時候還是要回到傳統渲染"],
      tools: ["Veras（SketchUp / Rhino / Revit）", "D5 Render AI", "ComfyUI"],
      practice: "用期中案的 SketchUp 白模，輸出三個視角並用 AI 渲染出一致的材質方案。",
      prompts: ["keep geometry exactly, apply materials: white oak floor, lime plaster walls, brushed brass details, soft overcast daylight, photorealistic"],
      homework: "繳交三視角一致的 AI 渲染圖，並說明如何維持一致性。",
      checks: ["白模輸出深度與線稿", "完成三視角渲染", "比較 AI 與傳統渲染"],
      challenge: "同一個白模視角，10 分鐘內產出「白天 / 黃昏 / 夜晚」三張燈光情境。"
    },
    {
      week: 13, res: "model", num: 10, short: "3D 生成",
      title: "圖生 3D 與 3D 生成",
      goals: ["從單張圖片或文字生成 3D 家具與擺件模型", "評估生成模型的拓樸與尺寸是否可用", "把生成模型匯入設計模型中"],
      points: ["文生 3D 與圖生 3D 的差異", "格式：GLB / OBJ / FBX 與貼圖", "減面、修正比例、重新指定材質", "3D 掃描與 AI 生成的結合"],
      tools: ["Meshy", "Tripo", "Rodin", "Polycam"],
      practice: "為期中案設計一張單椅，從草圖生成 3D 模型，匯入 SketchUp 或 Rhino 並修正尺寸。",
      prompts: ["a lounge chair with bent plywood frame and woven rattan seat, mid-century, clean topology, realistic proportions"],
      homework: "繳交一件 AI 生成並修正後的家具模型（GLB），附修正紀錄。",
      checks: ["完成圖生 3D", "修正模型比例與面數", "匯入設計模型"],
      challenge: "用一張產品照生成 3D 檯燈，並檢查它的尺寸是否合理。"
    },
    {
      week: 14, res: "model", num: 5, short: "影片漫遊",
      title: "AI 影片與空間漫遊",
      goals: ["用影像生成短片呈現空間氛圍", "控制鏡頭運動：推軌、環繞、升降", "剪輯 30 秒空間介紹影片"],
      points: ["圖生影片：以渲染圖作為首幀", "鏡頭語言：dolly in、orbit、crane up", "首尾幀控制，讓兩個空間自然轉場", "旁白、配樂與字幕的 AI 輔助"],
      tools: ["Runway", "Kling", "Luma", "MiniMax Hailuo", "CapCut / Premiere"],
      practice: "以第 12 週的渲染圖為首幀，生成 3 段 5 秒鏡頭並剪成一支短片。",
      prompts: ["slow dolly in through the living room toward the window, curtains moving gently in the breeze, warm afternoon light, steady cinematic camera"],
      homework: "繳交 30 秒空間介紹影片，附鏡頭腳本表。",
      checks: ["完成鏡頭腳本", "生成至少 3 段影片", "完成剪輯與字幕"],
      challenge: "寫一段 5 秒鏡頭的提示詞：從玄關推進到客廳，包含光線與鏡頭速度。"
    },
    {
      week: 15, res: "data", num: 11, short: "參數化 × AI",
      title: "參數化設計 × AI（Grasshopper）",
      goals: ["用自然語言請 AI 協助建立 Grasshopper 演算法", "生成參數化天花板、隔屏或壁面", "理解參數與設計意圖的對應"],
      points: ["參數化思維：把造型拆成可調的變數", "常見圖案：Voronoi、吸引點、波浪格柵", "LLM 協助寫 GhPython 與解釋元件", "從演算法到可施工：材料厚度、單元尺寸"],
      tools: ["Rhino + Grasshopper", "ChatGPT / Claude", "Grasshopper MCP"],
      practice: "設計一面受吸引點影響的木格柵隔屏，輸出三個參數版本。",
      prompts: ["請用 Grasshopper 元件步驟說明如何做出：寬 3 公尺、高 2.4 公尺的直向木格柵，格柵厚度隨距離吸引點遠近在 30–80mm 之間變化。"],
      homework: "繳交 Grasshopper 檔與三個參數版本的渲染圖。",
      checks: ["理解參數與變數設定", "完成格柵或天花板演算法", "產出三個參數版本"],
      challenge: "請 AI 解釋 Voronoi 元件的輸入與輸出，並用在一面櫃體門片上。"
    },
    {
      week: 16, res: "ethics", num: 3, short: "倫理版權",
      title: "版權、倫理與專業責任",
      goals: ["了解 AI 生成內容的著作權現況與平台條款", "辨識風格模仿、肖像與商標的風險", "建立對業主誠實揭露的做法"],
      points: ["生成內容能否受著作權保護：人類創作貢獻的程度", "平台授權條款：商用、免費方案與浮水印", "模仿在世設計師風格的倫理爭議", "效果圖與現場落差：避免對業主過度承諾"],
      tools: ["各平台使用條款", "Content Credentials（內容憑證）"],
      practice: "分組辯論：「事務所提案可以不告訴業主效果圖是 AI 生成的嗎？」",
      prompts: ["請以表格比較 Midjourney、Adobe Firefly、Stable Diffusion 在商業使用授權上的差異，並註明資料來源與查詢日期，我會自行查證。"],
      homework: "撰寫一頁「我的 AI 使用守則」，作為期末提案的附錄。",
      checks: ["讀過兩個平台的使用條款", "參與課堂辯論", "完成個人 AI 使用守則"],
      challenge: "舉出一個 AI 效果圖可能誤導業主的情況，並提出如何揭露。"
    },
    {
      week: 17, res: "data", num: 6, short: "提案整合",
      title: "AI 設計提案整合",
      goals: ["把研究、概念、渲染、影片整合成一份完整提案", "用 AI 協助簡報架構與講稿", "檢查提案中的一致性與事實正確性"],
      points: ["提案架構：問題 → 概念 → 空間策略 → 材質 → 預算與工期", "簡報生成工具的優點與陷阱", "講稿演練：請 AI 扮演挑剔的業主", "最後檢查：圖面尺寸、法規、材料規格要人工核對"],
      tools: ["Gamma / Canva / PowerPoint Copilot", "ChatGPT / Claude"],
      practice: "請 AI 扮演業主，針對你的提案進行 10 分鐘質詢模擬。",
      prompts: ["你現在是一位重視預算、對 AI 效果圖有疑慮的業主。請根據以下提案內容，連續問我 6 個問題，每次一題，等我回答後再問下一題：［貼上提案摘要］"],
      homework: "繳交期末提案簡報初稿與講稿。",
      checks: ["完成提案架構", "完成簡報初稿", "完成業主質詢模擬"],
      challenge: "用三句話說服業主選你的方案，再請 AI 找出其中的漏洞。"
    },
    {
      week: 18, res: "ethics", num: 8, short: "期末發表",
      title: "期末發表與評圖",
      goals: ["完整發表 AI 輔助室內設計提案", "清楚說明 AI 在流程中的角色與限制", "反思一學期的方法轉變"],
      points: ["每人 12 分鐘發表＋ 8 分鐘評圖", "必備：設計提案、AI 使用揭露表、個人 AI 使用守則", "評分重點：設計品質、方法整合、批判反思、表達", "課後：作品整理成個人作品集頁面"],
      tools: ["本學期所有工具"],
      practice: "發表後填寫同儕回饋表，並寫下一段給下一屆學弟妹的建議。",
      prompts: ["以下是我這學期的設計流程紀錄：［貼上］。請幫我整理成作品集中一頁的「設計方法說明」，200 字以內，語氣專業但不浮誇。"],
      homework: "繳交期末提案完整檔案與一頁學期反思。",
      checks: ["完成期末發表", "繳交 AI 使用揭露表", "完成學期反思"],
      challenge: "用 100 字寫下：這學期之後，你會怎麼在設計工作中使用 AI？"
    }
  ],

  /* 擲到 7 時出現的「幻覺迷霧」思辨題 */
  fog: [
    {
      q: "你請 AI 列出住宅樓梯的法規尺寸，它回答「級高不得大於 22 公分，並引用《建築技術規則》第 33 條」。最恰當的下一步是？",
      options: ["直接寫進設計說明，AI 已經附上條號", "自行查閱現行法規原文，確認數值與條號", "再問一次 AI，兩次答案一樣就採用"],
      answer: 1,
      why: "LLM 可能捏造或記錯條號與數值。法規要回到官方原文查證，重複詢問同一模型不能當作驗證。"
    },
    {
      q: "一張 AI 生成的樓中樓客廳效果圖很漂亮，但樓梯直接通到天花板上方。這代表什麼？",
      options: ["影像模型不理解結構與淨高，需要設計師修正", "這是一種新的設計語彙，可以保留", "解析度太低，放大就會正常"],
      answer: 0,
      why: "擴散模型只學到「看起來像」，不懂結構、淨高與動線。效果圖中的空間邏輯要由設計師負責。"
    },
    {
      q: "AI 建議某款「防潮等級 E0、耐磨 AC6」的超耐磨地板，並給了品牌型號。你應該？",
      options: ["直接寫進材料表", "向廠商索取型錄與檢驗報告核對", "改用 AI 推薦的另一款就好"],
      answer: 1,
      why: "規格與型號可能是拼湊出來的。材料規格要以廠商型錄、檢驗報告與樣品為準。"
    },
    {
      q: "你用 AI 把一間 8 坪套房渲染得非常寬敞明亮，業主很滿意。最大的專業風險是？",
      options: ["渲染太花時間", "廣角與光線讓空間感與現場落差太大，造成過度承諾", "業主可能會要更多張圖"],
      answer: 1,
      why: "過度廣角與理想化光線會誤導空間尺度。提案時應附平面尺寸與實際視角，避免交屋落差。"
    },
    {
      q: "AI 摘要業主訪談時寫出「業主希望保留和室」，但逐字稿中業主其實說「和室可以拆」。這是哪種問題？",
      options: ["幻覺：模型產出了來源中沒有的內容", "格式錯誤", "提示詞太短而已，與模型無關"],
      answer: 0,
      why: "摘要也會出現幻覺。關鍵需求要回到逐字稿原文核對，尤其是「要 / 不要」這類相反的資訊。"
    },
    {
      q: "AI 告訴你「某知名設計師曾說：『空間是光的容器』」，你想放進簡報。應該？",
      options: ["直接引用，聽起來很合理", "找到原始出處（書籍、訪談）後再引用，找不到就不引用", "改成「有設計師說過」就沒問題"],
      answer: 1,
      why: "名人名言是幻覺高發區。沒有可查證的出處就不要掛名引用。"
    },
    {
      q: "AI 估算「30 坪住宅全室裝修約 120 萬」。這個數字最適合拿來做什麼？",
      options: ["直接報價給業主", "只作為初步討論的量級，再以工班估價與市場行情修正", "當作合約金額的上限"],
      answer: 1,
      why: "AI 不知道你所在地區、工法與當下物價。數字只能當起點，正式報價要以實際估價為準。"
    },
    {
      q: "AI 生成的效果圖中，廚房吊櫃上方出現了一盞「融化」在櫃體裡的燈具。這張圖要放進提案，你該？",
      options: ["用局部重繪修正，或在圖說中標明示意", "業主看不出來，直接用", "整張圖都不能用了"],
      answer: 0,
      why: "破圖可以用局部重繪修正。放進提案前要檢查燈具、五金與家具的合理性，必要時標註「示意」。"
    }
  ],

  /* 用 4 張同種資源交換的知識卡 */
  cards: [
    { id: "neg", title: "負面提示詞", body: "把不想要的東西寫進 negative prompt：blurry, distorted furniture, extra windows, warped lines。破圖率會明顯下降。" },
    { id: "seed", title: "鎖定種子值", body: "找到滿意的構圖後固定種子值，只微調材質詞，就能做出同一視角的多個方案比較。" },
    { id: "ref", title: "風格參考圖", body: "Midjourney 的 --sref 或 IP-Adapter 可以用一張參考圖帶出整組一致的色調與質感，比堆形容詞更穩定。" },
    { id: "comfy", title: "ComfyUI 節點存檔", body: "把常用流程（草圖 → ControlNet → 放大）存成工作流 JSON，下次拖進來就能重用，也方便和同學交換。" },
    { id: "upscale", title: "放大與細節", body: "先用低解析度快速挑選，再用 upscaler 放大；放大時降低重繪強度（約 0.3）以保留構圖。" },
    { id: "chain", title: "提示詞串接", body: "讓 LLM 先寫空間描述，再請它轉成影像提示詞。中文想、英文生成，兩段式比一次寫完更精準。" },
    { id: "light", title: "光線詞彙表", body: "golden hour、overcast soft light、north-facing daylight、cove lighting、3000K warm white。光線決定氛圍的一半。" },
    { id: "lens", title: "鏡頭語彙", body: "24mm 廣角易變形，35mm 接近人眼，50mm 適合局部。加上 eye-level 與 one-point perspective 讓圖更像建築攝影。" },
    { id: "check", title: "交件前檢查表", body: "尺寸比例、樓梯淨高、門窗開向、燈具位置、材質接縫、揭露標註。六項都看過再交。" },
    { id: "credit", title: "內容憑證", body: "Adobe Firefly 等工具會加入 Content Credentials，可以證明圖片的生成來源，作為對業主揭露的佐證。" }
  ]
};
