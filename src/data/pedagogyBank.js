// Ngân hàng Dữ liệu Sư phạm Mĩ thuật Tiểu học (GDPT 2018 - Thông tư 32/2018/TT-BGDĐT)
// Chạy 100% Cục bộ (Offline) - Không cần API mạng - An toàn & Miễn phí

export const PEDAGOGY_BANK = {
  grades: [
    { id: 1, name: 'Lớp 1 (6 tuổi)' },
    { id: 2, name: 'Lớp 2 (7 tuổi)' },
    { id: 3, name: 'Lớp 3 (8 tuổi)' },
    { id: 4, name: 'Lớp 4 (9 tuổi)' },
    { id: 5, name: 'Lớp 5 (10 tuổi)' },
  ],
  themes: {
    1: [
      {
        id: 'g1_cd1',
        title: 'Chủ đề 1: Thế Giới Mĩ Thuật Quanh Em (Chấm, Nét, Màu sắc cơ bản)',
        objectives: {
          knowledge: 'Nhận biết được chấm, nét thẳng, nét cong; làm quen với 3 màu cơ bản: Đỏ, Vàng, Lam.',
          skills: 'Biết vẽ chấm, vạch nét tự do và tô màu vào hình vẽ đơn giản.',
          qualities: 'Nuôi dưỡng tình yêu cái đẹp từ những sự vật gần gũi trong đời sống, yêu thương gia đình.'
        },
        warmup: 'Trò chơi "Tìm nét vẽ trong lớp": Cô/Thầy đố các em tìm xem cánh cửa, chiếc bảng có nét gì? Nét thẳng hay nét cong?',
        questions: [
          'Em thấy trên cơ thể chú bọ rùa hay cánh bướm có những chấm tròn màu gì?',
          'Nếu dùng nét cong uốn lượn, em có thể vẽ được làn sóng biển hay ngọn đồi nào?',
          'Trong 3 màu Đỏ, Vàng, Lam, em thích màu nào nhất? Màu đó làm em nhớ đến quả gì?'
        ],
        teacherScript: 'Chào các con yêu quý! Hôm nay chúng mình cùng bước vào thế giới mĩ thuật diệu kì. Các con có biết không, mọi bức tranh tuyệt đẹp trên thế giới đều bắt đầu từ những chấm tròn nhỏ xíu và những đường nét đáng yêu đấy!',
        fourSteps: [
          'Bước 1: Chấm một vài điểm mốc định vị trên giấy',
          'Bước 2: Nối các chấm bằng nét thẳng hoặc nét cong để tạo hình quả/đồ vật',
          'Bước 3: Chọn màu cơ bản yêu thích tô phần chính',
          'Bước 4: Thêm các chấm hoa văn trang trí xung quanh'
        ]
      },
      {
        id: 'g1_cd2',
        title: 'Chủ đề 2: Ngôi Nhà Của Em (Hình vuông, tròn, tam giác)',
        objectives: {
          knowledge: 'Nhận biết hình vuông, hình tròn, hình tam giác, hình chữ nhật trong kiến trúc ngôi nhà.',
          skills: 'Ghép nối các hình học cơ bản tạo thành ngôi nhà thân yêu của gia đình.',
          qualities: 'Bồi dưỡng tình cảm gắn bó với mái ấm gia đình và trường lớp.'
        },
        warmup: 'Hát bài hát "Nhà của tôi" kết hợp đố vui: Mái nhà hình gì? Thân nhà hình gì?',
        questions: [
          'Mái nhà của gia đình em có hình tam giác hay hình thang?',
          'Cửa sổ hình vuông mở ra đón ánh nắng ban mai như thế nào?',
          'Xung quanh ngôi nhà em có cây cối, hoa lá hay con vật nuôi nào đáng yêu không?'
        ],
        teacherScript: 'Ngôi nhà là nơi chan chứa tình yêu thương của ông bà, cha mẹ. Hôm nay thầy/cô sẽ cùng các con trở thành những kiến trúc sư nhí tài ba để dựng nên ngôi nhà mơ ước bằng sắc màu rực rỡ nhé!',
        fourSteps: [
          'Bước 1: Vẽ thân nhà bằng hình vuông hoặc chữ nhật to ở giữa',
          'Bước 2: Vẽ mái nhà hình tam giác che chở bên trên',
          'Bước 3: Thêm cửa ra vào, cửa sổ hình chữ nhật nhỏ',
          'Bước 4: Tô màu tường nhà rực rỡ và vẽ thêm cây xanh, mặt trời'
        ]
      },
      {
        id: 'g1_cd3',
        title: 'Chủ đề 3: Động Vật Dưới Nước (Cá, Rùa biển, San hô)',
        objectives: {
          knowledge: 'Khám phá hình dáng đa dạng của các loài thủy sinh qua đường nét cong mềm mại.',
          skills: 'Vẽ thân cá hình bầu dục, vây hình tam giác và trang trí vảy cá nhiều màu sắc.',
          qualities: 'Ý thức bảo vệ môi trường biển và nguồn nước sạch.'
        },
        warmup: 'Cho học sinh nghe âm thanh tiếng sóng biển và đố tên các loài sinh vật biển.',
        questions: [
          'Chú cá đang bơi có thân hình giống hình gì nhỉ?',
          'Vảy cá lấp lánh dưới ánh nắng có những sắc màu nào?',
          'Em có muốn vẽ thêm những cụm rong biển và bọt nước tung tăng không?'
        ],
        teacherScript: 'Đại dương xanh thẳm đang vẫy gọi chúng mình! Hãy tưởng tượng các con đang lặn xuống đáy biển ngắm nhìn đàn cá rực rỡ bơi lội tung tăng giữa rạn san hô lấp lánh.',
        fourSteps: [
          'Bước 1: Vẽ thân cá bằng nét cong khép kín hình bầu dục',
          'Bước 2: Thêm đuôi cá xoè rộng và các vây nhỏ',
          'Bước 3: Vẽ mắt tròn, miệng xinh và đường cong vảy cá',
          'Bước 4: Lên màu rực rỡ cho cá và tô nền nước biển xanh biếc'
        ]
      }
    ],
    2: [
      {
        id: 'g2_cd1',
        title: 'Chủ đề 1: Đại Dương Lung Linh (Phối màu Nóng - Lạnh)',
        objectives: {
          knowledge: 'Phân biệt và cảm nhận sắc thái giữa gam màu nóng (đỏ, vàng, cam) và gam màu lạnh (lam, lục, tím).',
          skills: 'Sử dụng tương phản màu sắc để làm nổi bật hình ảnh chính trong tranh.',
          qualities: 'Rèn luyện khả năng quan sát thiên nhiên và cảm thụ thẩm mĩ tinh tế.'
        },
        warmup: 'Trò chơi "Cảm xúc màu sắc": Đưa các thẻ màu và hỏi học sinh màu nào ấm áp như mặt trời, màu nào mát rượi như que kem?',
        questions: [
          'Nếu nền tranh là màu nước biển xanh mát (gam lạnh), chú cá nên tô màu gì (gam nóng) để thật nổi bật?',
          'Các em nhận thấy sự đối lập màu sắc tạo nên điều kì diệu gì cho bức tranh?'
        ],
        teacherScript: 'Chào các họa sĩ nhí lớp 2! Hôm nay chúng ta sẽ làm quen với phép thuật của màu sắc: Màu Nóng làm bừng sáng niềm vui, còn Màu Lạnh mang lại sự dịu êm, thanh bình.',
        fourSteps: [
          'Bước 1: Xác định vị trí trọng tâm tranh bằng hình ảnh chính',
          'Bước 2: Phác nét chi tiết các sinh vật đại dương',
          'Bước 3: Tô màu nóng rực rỡ cho hình ảnh chính (chú cá, rạn san hô)',
          'Bước 4: Sử dụng gam màu lạnh phủ nền tạo độ sâu cho đại dương'
        ]
      },
      {
        id: 'g2_cd2',
        title: 'Chủ đề 2: Khu Vườn Nhiệt Đới (Họa tiết Hoa Lá & Động vật)',
        objectives: {
          knowledge: 'Nhận biết nhịp điệu lặp lại của đường nét và họa tiết thiên nhiên.',
          skills: 'Vẽ xen kẽ các tán lá to nhỏ, hoa cỏ và bướm ong rộn ràng.',
          qualities: 'Bồi dưỡng tình yêu thiên nhiên, thói quen chăm sóc cây xanh.'
        },
        warmup: 'Cho các em quan sát một chiếc lá bàng, lá dương xỉ thật để thấy các đường gân lá.',
        questions: [
          'Những chiếc gân lá tỏa ra như thế nào? Nét vẽ đó gợi cho em cảm xúc gì?',
          'Trong khu vườn bí mật của em, có loài hoa hay chú chim kì lạ nào trú ngụ?'
        ],
        teacherScript: 'Mỗi chiếc lá, mỗi cánh hoa trong vườn đều là một tác phẩm mĩ thuật tinh xảo của mẹ thiên nhiên. Hôm nay chúng mình hãy cùng đem cả khu vườn rực rỡ ấy vào trang giấy nhé!',
        fourSteps: [
          'Bước 1: Vẽ thân cây và các tán lá lớn tạo bộ khung cho khu vườn',
          'Bước 2: Vẽ thêm hoa nhiều cánh và các con côn trùng nhỏ',
          'Bước 3: Thêm chi tiết gân lá, nhụy hoa và hoa văn cánh bướm',
          'Bước 4: Tô màu các sắc độ xanh lá cây khác nhau tạo tầng lớp'
        ]
      }
    ],
    3: [
      {
        id: 'g3_cd1',
        title: 'Chủ đề 1: Tranh Tĩnh Vật Hoa Quả (Bố cục & Ánh sáng)',
        objectives: {
          knowledge: 'Hiểu khái niệm bố cục cân đối (hình chính - hình phụ), mảng sáng và mảng tối.',
          skills: 'Sắp xếp quả to, quả nhỏ hài hòa trên mặt bàn; biết gạn lọc chi tiết.',
          qualities: 'Tính kiên trì, tập trung quan sát tỉ mỉ cấu trúc hình thể đồ vật.'
        },
        warmup: 'Bày mẫu vật thật gồm 1 quả bưởi và 2 quả cam trên bàn để cả lớp cùng quan sát góc chiếu sáng.',
        questions: [
          'Khi ánh sáng chiếu từ bên trái sang, phía nào của quả sẽ sáng hơn, phía nào ngả bóng tối?',
          'Nếu đặt quả to che lấp một phần quả nhỏ thì tranh có sinh động hơn đặt hàng ngang không?'
        ],
        teacherScript: 'Tĩnh vật là thể loại tranh kinh điển của các danh họa thế giới. Hôm nay các em sẽ học cách nhìn của một họa sĩ thực thụ: nhìn thấy vẻ đẹp của khối cầu, của ánh sáng và bóng đổ!',
        fourSteps: [
          'Bước 1: Vẽ đường giới hạn mặt bàn và khung hình chữ nhật chung',
          'Bước 2: Phác vị trí quả chính và quả phụ tạo bố cục so le, che khuất',
          'Bước 3: Vẽ nét chuẩn xác hình dáng quả và cuống lá',
          'Bước 4: Lên màu đậm nhạt theo hướng ánh sáng và đổ bóng dưới đáy quả'
        ]
      },
      {
        id: 'g3_cd2',
        title: 'Chủ đề 2: Chân Dung Biểu Cảm Của Em & Bạn Bè',
        objectives: {
          knowledge: 'Nhận biết tỉ lệ khuôn mặt người (trục mắt, mũi, miệng, tai) và các biểu cảm cảm xúc (vui, ngạc nhiên, hân hoan).',
          skills: 'Vẽ chân dung bạn cùng bàn hoặc người thân với đặc điểm riêng biệt (kiểu tóc, mắt kính).',
          qualities: 'Tình bạn bè trong sáng, biết trân trọng và tôn trọng nét riêng của mỗi người.'
        },
        warmup: 'Trò chơi "Gương mặt cười - Gương mặt suy ngẫm": Cho các bạn làm mặt hề cho nhau xem.',
        questions: [
          'Khi cười tươi, đuôi mắt cong lên như vầng trăng khuyết và khóe miệng hướng về đâu?',
          'Bạn của em có mái tóc dài hay tóc ngắn? Bạn ấy đeo kính tròn hay vuông?'
        ],
        teacherScript: 'Mỗi nụ cười, ánh mắt của các em đều là một nguồn năng lượng tuyệt vời. Hãy quan sát thật kĩ người bạn thân yêu bên cạnh và ghi lại nụ cười rạng rỡ của bạn lên trang vẽ nhé!',
        fourSteps: [
          'Bước 1: Phác trục đối xứng và hình oval khuôn mặt',
          'Bước 2: Đánh dấu vị trí mắt ở đường giữa mặt, mũi và miệng',
          'Bước 3: Vẽ đặc điểm mái tóc, cổ áo và các phụ kiện',
          'Bước 4: Tô màu da, màu tóc và màu áo với sắc thái tươi vui'
        ]
      }
    ],
    4: [
      {
        id: 'g4_cd1',
        title: 'Chủ đề 1: Di Sản Văn Hóa & Họa Tiết Dân Tộc (Tranh Đông Hồ, Hoa văn Trống Đồng)',
        objectives: {
          knowledge: 'Hiểu về nét độc đáo của mĩ thuật truyền thống Việt Nam: tranh khắc gỗ dân gian, họa tiết hoa sen, chim Lạc.',
          skills: 'Mô phỏng hoặc sáng tạo lại họa tiết truyền thống trên sản phẩm mĩ thuật mới.',
          qualities: 'Lòng tự hào dân tộc, ý thức trân trọng và gìn giữ di sản văn hóa cha ông.'
        },
        warmup: 'Chiếu hình ảnh tranh Đông Hồ "Hứng dừa", "Đám cưới chuột" và cho học sinh tìm nhân vật hài hước trong tranh.',
        questions: [
          'Tranh Đông Hồ thường sử dụng những màu sắc tự nhiên nào (như màu vàng hoa hòe, màu đen than lá tre)?',
          'Nét viền đen đậm trong tranh dân gian mang lại cảm giác chắc khỏe như thế nào?'
        ],
        teacherScript: 'Mĩ thuật truyền thống Việt Nam mang trong mình hồn cốt ngàn năm của dân tộc. Từng đường nét mộc mạc, từng mảng màu dân dã đều thấm đượm tiếng cười lạc quan và ước vọng ấm no của ông cha ta.',
        fourSteps: [
          'Bước 1: Phác dáng nhân vật dân gian bằng các nét cong khỏe khoắn',
          'Bước 2: Nhấn nét viền đen đậm tạo phong cách tranh khắc gỗ',
          'Bước 3: Sử dụng các gam màu ấm dân dã (vàng đất, đỏ gạch, xanh chàm)',
          'Bước 4: Trang trí viền hoa văn truyền thống xung quanh bài vẽ'
        ]
      },
      {
        id: 'g4_cd2',
        title: 'Chủ đề 2: Phong Cảnh Quê Hương (Không gian xa - gần & Luật xa gần)',
        objectives: {
          knowledge: 'Nhận biết không gian ba chiều trong tranh phẳng: vật ở gần thì to, rõ, đậm; vật ở xa thì nhỏ, mờ, nhạt.',
          skills: 'Dựng bố cục phong cảnh làng quê, đồng lúa hoặc phố cổ có chiều sâu không gian.',
          qualities: 'Tình yêu quê hương, cảm xúc gắn bó với cảnh sắc non sông Việt Nam.'
        },
        warmup: 'Cho xem bức ảnh chụp con đường làng chạy dài tít tắp về phía chân trời.',
        questions: [
          'Vì sao rặng tre ở xa lại nhìn nhỏ và mờ hơn bụi cây ở ngay trước mắt chúng ta?',
          'Đường chân trời nằm ở vị trí nào trong bức tranh phong cảnh của em?'
        ],
        teacherScript: 'Bằng luật xa gần, các họa sĩ có thể mở ra một không gian bao la trên một mặt giấy phẳng. Hôm nay thầy/cô sẽ hướng dẫn các em bí quyết biến trang giấy thành cả một chân trời rộng mở!',
        fourSteps: [
          'Bước 1: Xác định đường tầm mắt (đường chân trời) ở 1/3 tranh',
          'Bước 2: Phác cảnh gần (cây cối, con người to, rõ nét)',
          'Bước 3: Phác cảnh xa (dãy núi, cánh buồm nhỏ nhắn mờ dần)',
          'Bước 4: Lên màu: Cận cảnh dùng màu đậm, viễn cảnh dùng màu nhạt pha lam'
        ]
      }
    ],
    5: [
      {
        id: 'g5_cd1',
        title: 'Chủ đề 1: Thiết Kế Đồ Họa & Poster Cổ Động (Chữ trang trí & Thông điệp)',
        objectives: {
          knowledge: 'Hiểu vai trò của Mĩ thuật ứng dụng: sự kết hợp giữa hình ảnh biểu tượng và kiểu chữ thông điệp.',
          skills: 'Tạo hình poster tuyên truyền (Bảo vệ môi trường, Tiết kiệm nước, Đọc sách).',
          qualities: 'Ý thức trách nhiệm công dân, tích cực lan tỏa thông điệp sống đẹp trong học đường.'
        },
        warmup: 'Trưng bày 2 poster: 1 cái nhiều chữ rườm rà, 1 cái hình ấn tượng chữ cô đọng để học sinh so sánh hiệu quả truyền thông.',
        questions: [
          'Biểu tượng hình ảnh nào làm người xem nhớ ngay đến thông điệp xanh?',
          'Kiểu chữ in hoa nét dày mang lại cảm giác mạnh mẽ, thúc giục hành động như thế nào?'
        ],
        teacherScript: 'Các em đã là anh chị cả của trường tiểu học! Giờ đây mĩ thuật không chỉ để ngắm nhìn mà còn là tiếng nói mạnh mẽ để truyền cảm hứng và thay đổi thế giới xung quanh!',
        fourSteps: [
          'Bước 1: Lên ý tưởng câu khẩu hiệu ngắn gọn, ý nghĩa (4-6 từ)',
          'Bước 2: Phác hình ảnh biểu tượng trọng tâm ở giữa poster',
          'Bước 3: Dựng khung chữ in hoa trang trí nổi bật, dễ đọc',
          'Bước 4: Sử dụng màu sắc tương phản mạnh để thu hút thị giác'
        ]
      },
      {
        id: 'g5_cd2',
        title: 'Chủ đề 2: Điêu Khắc & Tạo Hình Không Gian 3D (Đất nặn, Vật liệu tái chế)',
        objectives: {
          knowledge: 'Khám phá ngôn ngữ điêu khắc: khối đặc, khối rỗng, chất cảm bề mặt và không gian 3 chiều.',
          skills: 'Nhào nặn đất, cắt ghép vỏ hộp bìa carton tạo hình nhân vật hoặc công trình kiến trúc.',
          qualities: 'Tư duy tái chế xanh, sáng tạo biến những vật dụng bỏ đi thành tác phẩm nghệ thuật.'
        },
        warmup: 'Cho các em sờ vào bức tượng thạch cao và một khối đất sét để cảm nhận khối 3D trong lòng bàn tay.',
        questions: [
          'Tác phẩm tròn có thể ngắm nhìn từ bao nhiêu phía xung quanh?',
          'Từ một chiếc cốc giấy và ống hút, em có thể biến hóa thành con rô-bốt hay ngôi tháp nào?'
        ],
        teacherScript: 'Nghệ thuật không có giới hạn! Khi các em dùng đôi bàn tay biến những mẩu bìa, chai nhựa cũ thành những tác phẩm sinh động, các em chính là những nghệ sĩ kiến tạo môi trường xanh tuyệt vời nhất.',
        fourSteps: [
          'Bước 1: Phác thảo ý tưởng hình khối trên giấy trước khi làm',
          'Bước 2: Tạo khung xương chịu lực chính bằng vật liệu cứng',
          'Bước 3: Đắp khối tạo hình chi tiết bằng đất nặn hoặc vỏ hộp',
          'Bước 4: Hoàn thiện màu sắc, hoa văn trang trí bề mặt'
        ]
      }
    ]
  }
};
