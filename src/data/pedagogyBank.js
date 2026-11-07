// Ngân hàng Dữ liệu Sư phạm Mĩ thuật Tiểu học (GDPT 2018 - Thông tư 32/2018/TT-BGDĐT)
// Bộ sách Kết nối tri thức với cuộc sống (Đầy đủ từ Lớp 1 đến Lớp 5)
// Chạy 100% Cục bộ (Offline) - An toàn, Miễn phí & Chuẩn Sư phạm

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
        title: 'Chủ đề 1: Mĩ thuật trong nhà trường (Chấm, Nét, Màu sắc cơ bản)',
        genre: 'general',
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
        teacherScript: 'Chào các con yêu quý! Hôm nay chúng mình cùng bước vào thế giới mĩ thuật diệu kì. Mọi bức tranh tuyệt đẹp trên thế giới đều bắt đầu từ những chấm tròn nhỏ xíu và những đường nét đáng yêu đấy!',
        fourSteps: [
          'Bước 1: Chấm một vài điểm mốc định vị trên giấy',
          'Bước 2: Nối các chấm bằng nét thẳng hoặc nét cong để tạo hình quả/đồ vật',
          'Bước 3: Chọn màu cơ bản yêu thích tô phần chính',
          'Bước 4: Thêm các chấm hoa văn trang trí xung quanh'
        ]
      },
      {
        id: 'g1_cd2',
        title: 'Chủ đề 2: Sáng tạo từ những chấm màu',
        genre: 'craft_applied',
        objectives: {
          knowledge: 'Biết dùng chấm màu to, nhỏ, dày, thưa để tạo hình cây cối, con vật, pháo hoa.',
          skills: 'Chấm bằng đầu ngón tay, tăm bông hoặc bút màu tạo nhịp điệu sinh động.',
          qualities: 'Rèn luyện tính kiên nhẫn, khéo léo và hứng thú sáng tạo với chất liệu mới.'
        },
        warmup: 'Trò chơi "Cơn mưa sắc màu": Các con hãy dùng đầu ngón tay làm mưa rơi lách tách lên mặt bàn nào!',
        questions: [
          'Những chấm màu đặt cạnh nhau có tạo thành một chuỗi hạt lấp lánh không?',
          'Em muốn dùng chấm màu đỏ, vàng để vẽ chùm bóng bay hay vườn hoa rực rỡ?'
        ],
        teacherScript: 'Các con ơi! Những giọt màu nhỏ xíu khi đứng cạnh nhau sẽ tạo nên cả một bầu trời pháo hoa lung linh. Hôm nay chúng mình cùng nhảy múa với những chấm màu kì diệu nhé!',
        fourSteps: [
          'Bước 1: Chấm nhẹ các điểm tạo khung hình dáng bao quanh vật',
          'Bước 2: Chấm màu dày đặc vào phần trung tâm để làm nổi bật hình chính',
          'Bước 3: Dùng màu khác chấm thưa dần ở phần xung quanh tạo độ loang',
          'Bước 4: Hoàn thiện bức tranh bằng những chấm nhỏ li ti trang trí'
        ]
      },
      {
        id: 'g1_cd3',
        title: 'Chủ đề 3: Nét vẽ của em (Nét thẳng, nét cong, nét lượn sóng)',
        genre: 'general',
        objectives: {
          knowledge: 'Nhận biết các loại nét: nét thẳng đứng, nét nằm ngang, nét xiên, nét cong, nét xoắn ốc.',
          skills: 'Vẽ được các đường nét tự tin, phối hợp nhiều nét tạo thành bức tranh sinh động.',
          qualities: 'Tự tin bộc lộ cảm xúc thông qua từng nét vẽ hồn nhiên của tuổi thơ.'
        },
        warmup: 'Trò chơi "Bút chì bay": Giơ ngón tay vẽ nét lượn sóng trên không trung như cánh chim chao lượn.',
        questions: [
          'Nét xoắn ốc làm em liên tưởng đến vỏ chú ốc sên hay cơn gió lốc?',
          'Nét gấp khúc giúp em vẽ được hàng rào hay đỉnh núi nhấp nhô?'
        ],
        teacherScript: 'Bút chì trong tay các con giống như một cây gậy phép thuật! Chỉ cần lướt nhẹ một nét cong, chúng mình đã có ngay chiếc cầu vồng rực rỡ sau cơn mưa!',
        fourSteps: [
          'Bước 1: Vẽ nét nằm ngang làm mặt đất hoặc đường chân trời',
          'Bước 2: Dùng nét cong và nét thẳng tạo hình dáng ngôi nhà, cái cây',
          'Bước 3: Trang trí nét gợn sóng, nét đứt đoạn vào các chi tiết',
          'Bước 4: Tô màu các mảng nét bằng sắc màu tươi sáng'
        ]
      },
      {
        id: 'g1_cd4',
        title: 'Chủ đề 4: Sáng tạo từ những hình cơ bản (Hình vuông, tròn, tam giác, chữ nhật)',
        genre: 'general',
        objectives: {
          knowledge: 'Nhận biết hình vuông, tròn, tam giác, chữ nhật trong đồ vật và kiến trúc.',
          skills: 'Cắt ghép, vẽ kết hợp các hình cơ bản tạo thành đồ vật, ngôi nhà, phương tiện giao thông.',
          qualities: 'Bồi dưỡng tư duy hình học trực quan và khả năng liên tưởng sáng tạo.'
        },
        warmup: 'Đố vui tìm hình: Chiếc đồng hồ hình gì? Biển báo giao thông hình gì?',
        questions: [
          'Ghép một hình tam giác lên trên hình vuông, chúng mình được hình gì nhỉ?',
          'Hai hình tròn nhỏ đặt cạnh hình chữ nhật sẽ biến thành chiếc xe buýt ra sao?'
        ],
        teacherScript: 'Các hình học cơ bản là những người bạn thân thiết của chúng ta. Hãy cùng thầy/cô biến hóa những hình vuông, tròn ngộ nghĩnh thành đoàn tàu chở đầy ước mơ nhé!',
        fourSteps: [
          'Bước 1: Vẽ hoặc cắt các hình vuông, tròn, tam giác kích cỡ khác nhau',
          'Bước 2: Sắp xếp các hình cạnh nhau để tạo thành hình ngôi nhà hoặc xe ô tô',
          'Bước 3: Dán hoặc viền nét cố định vị trí các hình',
          'Bước 4: Vẽ thêm hoa cỏ, mây trời và tô màu hoàn thiện'
        ]
      },
      {
        id: 'g1_cd5',
        title: 'Chủ đề 5: Màu cơ bản trong mĩ thuật (Đỏ, Vàng, Lam)',
        genre: 'still_life',
        objectives: {
          knowledge: 'Ghi nhớ 3 màu gốc: Đỏ, Vàng, Lam; nhận biết màu sắc trong đồ vật quanh em.',
          skills: 'Sử dụng thuần thục 3 màu cơ bản để tô kín hình, không bị lem ra ngoài viền.',
          qualities: 'Yêu thích khám phá màu sắc thiên nhiên và cuộc sống xung quanh.'
        },
        warmup: 'Hát bài "Ba ngọn nến lung linh" tương ứng với 3 sắc màu Đỏ, Vàng, Lam.',
        questions: [
          'Quả dâu tây chín có màu gì? Ánh nắng mặt trời có màu gì?',
          'Màu xanh lam gợi cho các con nhớ đến dòng sông hay bầu trời bao la?'
        ],
        teacherScript: 'Đỏ rực rỡ như mặt trời, Vàng ấm áp như tia nắng, Lam dịu mát như biển sâu. Ba màu sắc này chính là chìa khóa mở ra vương quốc mĩ thuật diệu kì!',
        fourSteps: [
          'Bước 1: Vẽ hình quả táo, mặt trời hoặc bông hoa bằng nét chì đơn giản',
          'Bước 2: Dùng màu Đỏ tô hình quả dâu, quả táo mọng nước',
          'Bước 3: Dùng màu Vàng tô tia nắng ấm áp và nhuỵ hoa',
          'Bước 4: Dùng màu Lam tô bầu trời nền để các hình nổi bật rực rỡ'
        ]
      },
      {
        id: 'g1_cd6',
        title: 'Chủ đề 6: Sáng tạo từ những khối cơ bản (Khối vuông, khối trụ, khối cầu)',
        genre: 'craft_applied',
        objectives: {
          knowledge: 'Nhận biết các khối 3D đơn giản: khối hộp, khối cầu, khối trụ qua đất nặn, vỏ hộp.',
          skills: 'Nặn vo tròn, lăn dài, ấn dẹt đất nặn để tạo hình đồ vật quen thuộc.',
          qualities: 'Khéo léo đôi bàn tay, giữ gìn vệ sinh lớp học khi nặn đất.'
        },
        warmup: 'Cho học sinh nhắm mắt sờ vào quả bóng tròn và hộp phấn vuông để đoán tên khối.',
        questions: [
          'Khối cầu tròn lăn được trên bàn giống quả cam hay quả bóng?',
          'Từ một thỏi đất nặn hình trụ, em có thể biến thành chú sâu nhỏ như thế nào?'
        ],
        teacherScript: 'Đôi bàn tay nhỏ xinh của chúng mình hôm nay sẽ làm ảo thuật nhé! Từ những cục đất nặn dẻo thơm, chúng mình sẽ nặn ra cả một vườn trái cây ngon lành!',
        fourSteps: [
          'Bước 1: Nhào đất cho mềm dẻo và chia thành các phần nhỏ',
          'Bước 2: Vo tròn tạo khối cầu (quả cam, đầu chú gấu)',
          'Bước 3: Lăn dài tạo khối trụ (thân con sâu, cành cây)',
          'Bước 4: Ghép dính các khối lại với nhau và miết nhẹ mối nối'
        ]
      },
      {
        id: 'g1_cd7',
        title: 'Chủ đề 7: Hoa, quả quanh em',
        genre: 'still_life',
        objectives: {
          knowledge: 'Quan sát hình dáng, màu sắc đa dạng của các loại hoa quả quen thuộc.',
          skills: 'Vẽ hoa cánh tròn, cánh dài; vẽ quả dạng hình tròn, hình bầu dục và tô màu tươi sáng.',
          qualities: 'Yêu thiên nhiên, biết ơn người nông dân trồng cây ăn quả.'
        },
        warmup: 'Đố vui về các loại quả: Quả gì cong cong vàng ươm khỉ thích ăn nhất?',
        questions: [
          'Bông hoa hướng dương có nhuỵ màu gì và cánh hoa xòe ra sao?',
          'Quả dưa hấu có hình tròn hay bầu dục? Trên vỏ có những đường vân màu gì?'
        ],
        teacherScript: 'Khu vườn nhà em mùa này thật rực rỡ với muôn sắc hoa thơm và trái ngọt! Hôm nay chúng mình hãy hái những bông hoa đẹp nhất đưa vào trang giấy nhé!',
        fourSteps: [
          'Bước 1: Vẽ nhuỵ hoa tròn hoặc cuống quả định vị ở giữa trang giấy',
          'Bước 2: Vẽ các cánh hoa xòe đều xung quanh nhuỵ, hoặc vẽ thân quả căng mọng',
          'Bước 3: Thêm cành lá xanh và gân lá xinh xắn',
          'Bước 4: Tô màu hoa rực rỡ và quả chín ngọt ngào'
        ]
      },
      {
        id: 'g1_cd8',
        title: 'Chủ đề 8: Người thân của em (Gia đình yêu thương)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Nhận biết đặc điểm khuôn mặt và vóc dáng người thân (ông bà, cha mẹ, anh chị em).',
          skills: 'Vẽ chân dung đơn giản có mắt, mũi, miệng cười và mái tóc đặc trưng.',
          qualities: 'Tình cảm kính yêu ông bà cha mẹ, biết ơn sự chăm sóc của gia đình.'
        },
        warmup: 'Hát bài "Cả nhà thương nhau" và kể về người em yêu quý nhất trong nhà.',
        questions: [
          'Mẹ em có mái tóc dài hay ngắn? Nụ cười của mẹ rạng rỡ thế nào?',
          'Bố em có đeo kính không? Dáng người bố cao lớn ra sao?'
        ],
        teacherScript: 'Gia đình là tổ ấm ngọt ngào nhất của mỗi chúng ta. Trong mắt các con, ông bà cha mẹ luôn là những người tuyệt vời nhất. Hãy vẽ lại nụ cười của người thân yêu nhé!',
        fourSteps: [
          'Bước 1: Vẽ hình tròn hoặc bầu dục to làm khuôn mặt ở trung tâm',
          'Bước 2: Vẽ hai mắt tròn long lanh, chiếc mũi nhỏ và miệng cười tươi',
          'Bước 3: Vẽ mái tóc, tai và cổ áo',
          'Bước 4: Tô màu da ấm áp, màu tóc đen/nâu và áo màu tươi sáng'
        ]
      },
      {
        id: 'g1_cd9',
        title: 'Chủ đề 9: Em là học sinh lớp 1',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Cảm nhận niềm vui khi bước vào trường tiểu học, mang đồng phục, cặp sách mới.',
          skills: 'Vẽ bạn học sinh đang vui bước tới trường hoặc đang ngồi học bài.',
          qualities: 'Hào hứng, tự hào khi trở thành học sinh lớp 1, yêu quý thầy cô trường lớp.'
        },
        warmup: 'Hát bài "Đi học" kết hợp vỗ tay theo nhịp bước chân rộn ràng.',
        questions: [
          'Chiếc cặp sách em đeo trên vai có màu gì và hình dáng ra sao?',
          'Con đường tới trường của em có hàng cây xanh hay cờ hoa rực rỡ?'
        ],
        teacherScript: 'Ngày đầu tiên đi học, mẹ dắt tay từng bước. Hôm nay các con đã là những cô bé, cậu bé học sinh lớp 1 chăm ngoan. Chúng mình hãy vẽ lại khoảnh khắc rạng rỡ này nhé!',
        fourSteps: [
          'Bước 1: Phác khuôn mặt tròn và nụ cười rạng rỡ của bạn nhỏ',
          'Bước 2: Vẽ thân áo đồng phục và chiếc khăn quàng/cặp sách trên vai',
          'Bước 3: Vẽ đôi chân đang bước đi trên con đường rợp bóng cây',
          'Bước 4: Tô màu đồng phục trang nghiêm và vẽ thêm mái trường phía xa'
        ]
      }
    ],
    2: [
      {
        id: 'g2_cd1',
        title: 'Chủ đề 1: Mĩ thuật trong cuộc sống',
        genre: 'general',
        objectives: {
          knowledge: 'Hiểu mĩ thuật hiện diện ở khắp mọi nơi: trang phục, đồ dùng, nhà cửa, thiên nhiên.',
          skills: 'Biết chọn lọc hình ảnh đẹp trong cuộc sống hàng ngày để đưa vào tranh vẽ.',
          qualities: 'Hình thành thói quen quan sát và rung động trước vẻ đẹp bình dị quanh mình.'
        },
        warmup: 'Trò chơi "Kính lúp thám tử": Tìm 3 đồ vật có hoa văn đẹp nhất trong lớp học.',
        questions: [
          'Chiếc cặp sách hay chiếc áo em mặc có những họa tiết trang trí nào đẹp mắt?',
          'Một chiếc cốc uống nước được in hình chú gấu nhỏ làm em thấy vui vẻ ra sao?'
        ],
        teacherScript: 'Mĩ thuật không chỉ nằm trong bảo tàng hay trang sách, mĩ thuật đang mỉm cười với các em ngay trên chiếc cặp sách, chiếc bình hoa của mẹ!',
        fourSteps: [
          'Bước 1: Quan sát và chọn một đồ vật quen thuộc em yêu thích nhất',
          'Bước 2: Phác dáng bao quát của đồ vật cân đối trên trang giấy',
          'Bước 3: Vẽ thêm họa tiết trang trí hoa văn, nhân vật hoạt hình ngộ nghĩnh',
          'Bước 4: Phối màu sắc hài hòa làm nổi bật vẻ đẹp của sản phẩm'
        ]
      },
      {
        id: 'g2_cd2',
        title: 'Chủ đề 2: Sự thú vị của nét',
        genre: 'general',
        objectives: {
          knowledge: 'Khám phá biểu cảm phong phú của nét: nét thanh, nét đậm, nét đứt, nét zíc zắc.',
          skills: 'Sử dụng các nét vẽ tương phản để tạo nhịp điệu và bề mặt chất cảm phong phú.',
          qualities: 'Phát triển sự khéo léo, tự do sáng tạo đường nét theo cảm xúc.'
        },
        warmup: 'Cho xem bức tranh vẽ tóc nàng tiên cá bằng hàng trăm nét lượn sóng mềm mại.',
        questions: [
          'Nét vẽ thanh mảnh làm em thấy nhẹ nhàng, còn nét đậm to khỏe mang lại cảm giác gì?',
          'Em có thể vẽ những ngọn cỏ bằng nét xiên nhọn sắc bén không?'
        ],
        teacherScript: 'Từng đường nét uốn lượn như đang hát ca trên trang giấy! Hôm nay các em hãy để bàn tay mình tự do nhảy múa cùng muôn vàn nét vẽ thú vị nhé!',
        fourSteps: [
          'Bước 1: Phác khung hình chính bằng nét chì mờ',
          'Bước 2: Dùng bút sáp/dạ đồ lại nét với độ thanh đậm khác nhau',
          'Bước 3: Lồng ghép các nét zíc zắc, lượn sóng tạo vân bề mặt',
          'Bước 4: Chấm phá màu sắc tương phản tôn lên vũ điệu của nét'
        ]
      },
      {
        id: 'g2_cd3',
        title: 'Chủ đề 3: Sự kết hợp của các hình cơ bản',
        genre: 'general',
        objectives: {
          knowledge: 'Biết phối hợp các hình học cơ bản (vuông, tròn, tam giác) tạo hình con vật, cây cối, xe cộ.',
          skills: 'Sắp xếp bố cục hình chính to rõ ở giữa, hình phụ xung quanh hài hòa.',
          qualities: 'Phát triển tư duy logic thị giác và khả năng khái quát hình ảnh.'
        },
        warmup: 'Đố ghép hình: Từ 3 hình tam giác và 1 hình chữ nhật, em ghép thành chiếc thuyền buồm thế nào?',
        questions: [
          'Thân chú mèo có thể quy về hình bầu dục, còn đôi tai là hình gì?',
          'Các hình học đứng cạnh nhau tạo nên nhịp điệu vui tươi ra sao?'
        ],
        teacherScript: 'Mọi sinh vật phức tạp trong tự nhiên đều có thể tạo nên từ những hình học đơn giản nhất. Hãy cùng thầy/cô biến hình học thành những người bạn muôn loài nhé!',
        fourSteps: [
          'Bước 1: Nhìn nhận đối tượng và quy về các hình cơ bản lớn',
          'Bước 2: Vẽ phác các hình học chính xác định vị trí trọng tâm',
          'Bước 3: Nối liền và bo mềm các góc nét để hình vẽ tự nhiên hơn',
          'Bước 4: Lên màu rực rỡ và vẽ thêm cảnh nền sinh động'
        ]
      },
      {
        id: 'g2_cd4',
        title: 'Chủ đề 4: Những mảng màu yêu thích (Gam màu Nóng - Lạnh)',
        genre: 'landscape',
        objectives: {
          knowledge: 'Phân biệt gam màu nóng (đỏ, cam, vàng) và gam màu lạnh (xanh lam, xanh lá, tím).',
          skills: 'Ứng dụng tương phản nóng - lạnh để tạo điểm nhấn thị giác trong tranh phong cảnh, sinh hoạt.',
          qualities: 'Cảm thụ cảm xúc màu sắc: ấm áp, nồng nhiệt hay mát mẻ, thanh bình.'
        },
        warmup: 'Trò chơi "Mùa hè đỏ rực - Mùa đông xanh biếc": Phân loại các thẻ màu theo mùa.',
        questions: [
          'Nếu nền tranh là màu nước biển xanh mát (gam lạnh), chú cá nên tô màu gì để thật nổi bật?',
          'Bức tranh hoàng hôn rực rỡ làm em cảm thấy ấm cúng như thế nào?'
        ],
        teacherScript: 'Màu nóng làm bừng sáng niềm vui và năng lượng, còn màu lạnh mang lại sự tĩnh lặng, mát dịu. Sự kết hợp giữa nóng và lạnh chính là phép thuật của danh họa!',
        fourSteps: [
          'Bước 1: Xác định chủ thể chính đặt ở vị trí 1/3 tranh',
          'Bước 2: Chọn một gam màu chủ đạo cho toàn bài (nóng hoặc lạnh)',
          'Bước 3: Dùng gam màu đối lập tô điểm cho chi tiết chính để tạo điểm nhấn',
          'Bước 4: Điều chỉnh độ đậm nhạt và hoàn thiện nền tranh'
        ]
      },
      {
        id: 'g2_cd5',
        title: 'Chủ đề 5: Sự kết hợp thú vị của khối',
        genre: 'craft_applied',
        objectives: {
          knowledge: 'Nhận biết sự chuyển tiếp từ hình phẳng 2D sang khối không gian 3D qua đất nặn, mô hình giấy.',
          skills: 'Tạo hình khối trụ, khối nón, khối hộp và liên kết thành mô hình đồ chơi sinh động.',
          qualities: 'Say mê khám phá cấu trúc không gian và rèn luyện tính kiên nhẫn.'
        },
        warmup: 'Quan sát một chiếc bút chì (khối trụ) và chiếc mũ sinh nhật (khối nón).',
        questions: [
          'Khối nón có đỉnh nhọn và đáy tròn làm em liên tưởng đến ngọn tháp hay cây thông Noel?',
          'Làm thế nào để gắn chiếc đầu khối cầu vào thân khối trụ thật chắc chắn?'
        ],
        teacherScript: 'Không gian ba chiều mở ra ngay trong lòng bàn tay các em! Từ những khối đất sét nhỏ xinh, chúng mình sẽ đắp xây cả một tòa lâu đài nguy nga nhé!',
        fourSteps: [
          'Bước 1: Lên ý tưởng mô hình và chuẩn bị các khối đất nặn cơ bản',
          'Bước 2: Tạo khối lớn làm thân trụ chịu lực',
          'Bước 3: Gắn các khối phụ (tai, chân, mái tháp) bằng cách miết chặt',
          'Bước 4: Dùng que tăm khắc hoa văn và trang trí màu sắc nổi bật'
        ]
      },
      {
        id: 'g2_cd6',
        title: 'Chủ đề 6: Sắc màu thiên nhiên (Cây cối, hoa lá & Côn trùng)',
        genre: 'landscape',
        objectives: {
          knowledge: 'Khám phá sự phong phú của sắc xanh lá cây, sắc vàng của hoa và cánh bướm rực rỡ.',
          skills: 'Vẽ phong cảnh vườn cây, đồng cỏ có nhiều sắc độ đậm nhạt khác nhau.',
          qualities: 'Ý thức yêu quý cây xanh, bảo vệ côn trùng có ích và môi trường thiên nhiên.'
        },
        warmup: 'Cho nghe tiếng chim hót líu lo và tiếng gió thổi rì rào trong tán lá.',
        questions: [
          'Lá cây non có màu xanh nõn chuối, vậy lá cây già chuyển sang màu gì?',
          'Chú bướm đang đậu trên bông hoa có đôi cánh đối xứng hoa văn ra sao?'
        ],
        teacherScript: 'Mẹ Thiên Nhiên là người họa sĩ vĩ đại nhất! Mỗi chiếc lá, mỗi cánh hoa đều là một tác phẩm nghệ thuật tuyệt mĩ. Hãy mang khu vườn thơm ngát vào tranh vẽ nhé!',
        fourSteps: [
          'Bước 1: Vẽ thân cây lớn với các cành nhánh vươn dài che bóng mát',
          'Bước 2: Vẽ các tán lá bồng bềnh như đám mây xanh',
          'Bước 3: Thêm đàn bướm rập rờn, chú chim nhỏ và những đóa hoa rực rỡ',
          'Bước 4: Phối nhiều sắc độ xanh lá (xanh non, xanh đậm) tạo chiều sâu'
        ]
      },
      {
        id: 'g2_cd7',
        title: 'Chủ đề 7: Gương mặt thân quen (Chân dung biểu cảm)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Nhận biết các bộ phận trên khuôn mặt và các sắc thái biểu cảm (vui vẻ, ngạc nhiên, trầm ngâm).',
          skills: 'Vẽ chân dung bạn bè hoặc người thân có nét biểu cảm sinh động qua mắt, miệng.',
          qualities: 'Gắn kết tình bạn, biết đồng cảm và sẻ chia cảm xúc với mọi người.'
        },
        warmup: 'Trò chơi "Soi gương làm mặt cười - mặt mếu" cùng bạn cùng bàn.',
        questions: [
          'Khi bạn cười tít mắt, khóe miệng nhếch lên để lộ hàm răng trắng xinh ra sao?',
          'Đôi mắt to tròn thể hiện sự ngạc nhiên, thích thú như thế nào?'
        ],
        teacherScript: 'Mỗi nụ cười của các em là một bông hoa rạng rỡ làm ấm áp cả lớp học. Hãy ngắm nhìn người bạn thân yêu và vẽ lại nụ cười đẹp nhất của bạn nhé!',
        fourSteps: [
          'Bước 1: Vẽ khung oval khuôn mặt cân đối ở giữa trang giấy',
          'Bước 2: Chia trục xác định vị trí mắt, mũi, miệng cân xứng',
          'Bước 3: Thể hiện biểu cảm vui tươi qua nét cong khóe miệng và ánh mắt sáng',
          'Bước 4: Vẽ mái tóc bồng bềnh, áo đồng phục và tô màu ấm áp'
        ]
      },
      {
        id: 'g2_cd8',
        title: 'Chủ đề 8: Bữa cơm gia đình (Gia đình sum họp đầm ấm)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Cảm nhận không khí sum vầy, ấm cúng bên mâm cơm gia đình với đầy đủ các thành viên.',
          skills: 'Sắp xếp bố cục nhiều người ngồi quây quần quanh bàn ăn với các dáng ngồi, gắp thức ăn.',
          qualities: 'Trân trọng những bữa cơm mẹ nấu, biết ơn cha mẹ và yêu thương mái ấm gia đình.'
        },
        warmup: 'Kể tên món ăn ngon nhất mà mẹ hoặc bà thường nấu cho em ăn vào buổi tối.',
        questions: [
          'Mâm cơm nhà em có những món ăn quen thuộc nào? Chiếc bát, đôi đũa xếp ra sao?',
          'Khuôn mặt của ông bà, bố mẹ khi cả nhà quây quần trò chuyện vui vẻ thế nào?'
        ],
        teacherScript: 'Không gì ấm áp bằng lúc cả nhà cùng quây quần bên mâm cơm nóng hổi sau một ngày làm việc và học tập. Bức tranh bữa cơm gia đình sẽ tràn ngập tình yêu thương!',
        fourSteps: [
          'Bước 1: Phác chiếc bàn ăn hình tròn hoặc chữ nhật ở giữa không gian phòng',
          'Bước 2: Vẽ các thành viên gia đình (bố, mẹ, em, ông bà) ngồi quây quần xung quanh',
          'Bước 3: Thêm các chi tiết ấm cúng: bát cơm, đĩa cá, bình hoa, ấm trà',
          'Bước 4: Tô màu với gam màu vàng ấm áp, thể hiện không khí đoàn viên'
        ]
      },
      {
        id: 'g2_cd9',
        title: 'Chủ đề 9: Thầy cô của em (Tri ân ngày Nhà giáo)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Khắc họa hình ảnh thầy giáo, cô giáo dịu hiền trên bục giảng hoặc giờ ra chơi.',
          skills: 'Vẽ dáng cô giáo đứng giảng bài, tay cầm viên phấn bên bảng đen hoặc học sinh tặng hoa.',
          qualities: 'Lòng kính trọng, biết ơn sâu sắc đối với công ơn dạy dỗ của thầy cô.'
        },
        warmup: 'Hát bài "Bụi phấn" hoặc "Cô giáo em" để khơi gợi cảm xúc tri ân.',
        questions: [
          'Cô giáo em thường mặc tà áo dài màu gì khi bước vào lớp?',
          'Ánh mắt dịu hiền và bàn tay cô ân cần cầm tay em nắn từng nét chữ ra sao?'
        ],
        teacherScript: 'Thầy cô như người cha, người mẹ thứ hai dìu dắt các em trên con đường tri thức. Một bức tranh vẽ tặng thầy cô bằng cả tấm lòng chính là món quà quý giá nhất!',
        fourSteps: [
          'Bước 1: Phác dáng cô giáo đứng duyên dáng bên chiếc bảng lớp học',
          'Bước 2: Vẽ các bạn học sinh đang chăm chú nghe giảng hoặc dâng tặng bó hoa tươi',
          'Bước 3: Vẽ thêm chi tiết lớp học: dòng chữ trên bảng, bục giảng, chậu hoa nhỏ',
          'Bước 4: Tô màu tà áo dài thướt tha và sắc màu ấm cúng của lớp học'
        ]
      },
      {
        id: 'g2_cd10',
        title: 'Chủ đề 10: Đồ chơi từ tạo hình con vật (Đất nặn, Vật liệu tái chế)',
        genre: 'animals',
        objectives: {
          knowledge: 'Khám phá thế giới động vật ngộ nghĩnh và cách tái sử dụng vỏ hộp, nắp chai làm đồ chơi.',
          skills: 'Tạo hình chú rùa, chú cá, chú chim từ cốc giấy, đất nặn và bìa màu.',
          qualities: 'Ý thức tiết kiệm, yêu quý động vật và sáng tạo đồ chơi xanh.'
        },
        warmup: 'Cho xem một chú rùa ngộ nghĩnh làm từ nửa quả bóng bàn và nắp chai nhựa.',
        questions: [
          'Mai rùa có hình vòm cung giống chiếc bát úp hay nắp hộp nào?',
          'Em muốn gắn thêm đôi mắt hạt cườm hay dùng bút vẽ mắt cho chú thú bông?'
        ],
        teacherScript: 'Từ những vỏ hộp bỏ đi, đôi bàn tay khéo léo của các em có thể thổi hồn biến chúng thành cả một vườn thú đồ chơi đáng yêu và ngộ nghĩnh!',
        fourSteps: [
          'Bước 1: Chọn vật liệu tái chế phù hợp làm thân con vật (vỏ hộp, lõi giấy)',
          'Bước 2: Dùng đất nặn hoặc cắt giấy màu tạo đầu, tai, chân và đuôi',
          'Bước 3: Gắn ghép các bộ phận vào thân bằng keo dán an toàn',
          'Bước 4: Trang trí hoa văn, đốm màu sặc sỡ cho con vật'
        ]
      }
    ],
    3: [
      {
        id: 'g3_cd1',
        title: 'Chủ đề 1: Em yêu Mĩ thuật (Khám phá bảo tàng & Dụng cụ vẽ)',
        genre: 'general',
        objectives: {
          knowledge: 'Mở rộng hiểu biết về các hình thức mĩ thuật: hội họa, đồ họa, điêu khắc, mĩ thuật ứng dụng.',
          skills: 'Vẽ lại góc sáng tạo mĩ thuật của em với bảng màu, giá vẽ, cây cọ.',
          qualities: 'Nuôi dưỡng đam mê nghệ thuật và trân trọng lao động sáng tạo của họa sĩ.'
        },
        warmup: 'Cho xem clip ngắn các họa sĩ đang say sưa vẽ tranh bên bờ biển.',
        questions: [
          'Chiếc bảng pha màu có những ô màu nào rực rỡ nhất?',
          'Cây cọ vẽ lướt trên mặt vải toan tạo ra những vệt sơn dầu kì diệu ra sao?'
        ],
        teacherScript: 'Bước vào lớp 3, mĩ thuật sẽ mở ra cho các em những chân trời rộng lớn hơn. Chúng mình không chỉ vẽ tranh mà còn học cách cảm thụ vẻ đẹp của hội họa đỉnh cao!',
        fourSteps: [
          'Bước 1: Phác bố cục góc học tập hoặc chiếc giá vẽ ở trung tâm',
          'Bước 2: Vẽ chi tiết bảng màu tròn, ống cọ và những tuýp màu xinh xắn',
          'Bước 3: Thêm bài vẽ nhỏ đang dang dở trên giá vẽ',
          'Bước 4: Lên màu rực rỡ thể hiện không gian tràn đầy cảm hứng'
        ]
      },
      {
        id: 'g3_cd2',
        title: 'Chủ đề 2: Hoa văn trên trang phục của một số dân tộc',
        genre: 'craft_applied',
        objectives: {
          knowledge: 'Khám phá nét độc đáo của hoa văn thổ cẩm các dân tộc H’Mông, Dao, Thái, Ê-đê.',
          skills: 'Vẽ lặp lại, đối xứng các họa tiết hình thoi, đường zíc zắc, hoa lá cách điệu.',
          qualities: 'Tôn trọng và yêu quý bản sắc văn hóa các dân tộc anh em trên dải đất Việt Nam.'
        },
        warmup: 'Cho học sinh sờ vào tấm khăn thổ cẩm dệt tay nhiều màu sắc.',
        questions: [
          'Họa tiết hoa văn thổ cẩm thường được thêu bằng những màu sắc tương phản nào?',
          'Hình con chim cách điệu hay mặt trời trên váy áo người H’Mông có gì độc đáo?'
        ],
        teacherScript: 'Đất nước Việt Nam ta có 54 dân tộc anh em, mỗi dân tộc đều có những bộ trang phục rực rỡ như những bông hoa rừng khoe sắc giữa đại ngàn.',
        fourSteps: [
          'Bước 1: Dựng các đường kẻ song song tạo dải băng viền trang phục',
          'Bước 2: Phác họa tiết hình học đối xứng (hình thoi, tam giác, hoa sao)',
          'Bước 3: Lặp lại họa tiết theo nhịp điệu đều đặn',
          'Bước 4: Tô màu tương phản nổi bật: đỏ, đen, vàng, chàm'
        ]
      },
      {
        id: 'g3_cd3',
        title: 'Chủ đề 3: Màu sắc em yêu (Sắc độ Đậm - Nhạt)',
        genre: 'still_life',
        objectives: {
          knowledge: 'Hiểu khái niệm sắc độ: Đậm - Trung gian - Nhạt; cách pha màu với trắng hoặc đen.',
          skills: 'Thể hiện được ít nhất 3 cung bậc sắc độ trên một hình khối tạo khối nổi 3D.',
          qualities: 'Cảm nhận ánh sáng và bóng tối trong hội họa tả thực.'
        },
        warmup: 'So sánh bức ảnh chụp quả bóng dưới ánh đèn pin: vùng sáng chói, vùng tối đậm.',
        questions: [
          'Phía nào của quả táo đón nhận ánh sáng mặt trời chiếu vào?',
          'Vùng bóng đổ trên mặt bàn có sắc độ đậm hay nhạt hơn quả táo?'
        ],
        teacherScript: 'Ánh sáng chính là linh hồn của bức tranh! Khi các em biết điều khiển sắc độ đậm nhạt, hình vẽ phẳng lì sẽ bỗng chốc bật nổi thành khối tròn căng mọng!',
        fourSteps: [
          'Bước 1: Vẽ hình quả tròn và đường viền mép bàn phía sau',
          'Bước 2: Xác định hướng nguồn sáng chiếu từ góc trên bên trái',
          'Bước 3: Tô màu mảng sáng nhất để trắng hoặc màu nhạt',
          'Bước 4: Nhấn màu đậm dần về phía đối diện và vẽ bóng đổ trên mặt bàn'
        ]
      },
      {
        id: 'g3_cd4',
        title: 'Chủ đề 4: Vẻ đẹp của khối (Khối cầu, khối trụ, khối hộp)',
        genre: 'still_life',
        objectives: {
          knowledge: 'Nhận biết vẻ đẹp cân đối, vững chãi của khối hộp, khối trụ trong đồ vật kiến trúc.',
          skills: 'Vẽ tĩnh vật phối hợp khối hộp (hộp sữa) và khối cầu (quả cam) có không gian xa gần.',
          qualities: 'Rèn luyện khả năng quan sát khoa học và tính tỉ mỉ, kiên nhẫn.'
        },
        warmup: 'Đặt một bình nước hình trụ cạnh chiếc hộp bánh hình hộp chữ nhật để học sinh so sánh.',
        questions: [
          'Khối trụ có đáy tròn nằm ngang khi nhìn nghiêng sẽ biến thành hình elip ra sao?',
          'Đồ vật nào đứng trước che khuất một phần đồ vật đứng sau?'
        ],
        teacherScript: 'Vẽ tĩnh vật theo mẫu là bài tập kinh điển của các danh họa thế giới. Hôm nay chúng mình cùng học cách sắp đặt và bắt trọn hình khối tuyệt đẹp nhé!',
        fourSteps: [
          'Bước 1: Kẻ đường chân trời (mép bàn) phân chia không gian tường và bàn',
          'Bước 2: Phác khung hình chung bao quát toàn bộ mẫu vật',
          'Bước 3: Dựng chi tiết khối hộp và khối trụ, chú ý nét che khuất',
          'Bước 4: Đánh bóng sắc độ sáng tối và bóng ngả trên mặt bàn'
        ]
      },
      {
        id: 'g3_cd5',
        title: 'Chủ đề 5: Một số vật liệu sử dụng trong thực hành, sáng tạo mĩ thuật',
        genre: 'craft_applied',
        objectives: {
          knowledge: 'Khám phá chất cảm phong phú của lá cây khô, len sợi, cúc áo, cát màu.',
          skills: 'Xé dán, đính kết các vật liệu tự nhiên tạo nên bức tranh nổi sinh động.',
          qualities: 'Tình yêu thiên nhiên, ý thức tận dụng phế liệu bảo vệ môi trường.'
        },
        warmup: 'Cho các em sờ vào chiếc lá khô ráp ráp và sợi len mềm mại để cảm nhận sự đối lập.',
        questions: [
          'Chiếc lá bàng rụng mùa thu có hình dáng giống cánh buồm hay mai rùa?',
          'Những chiếc cúc áo tròn xoe có thể biến thành mắt chú cú mèo ra sao?'
        ],
        teacherScript: 'Thiên nhiên ban tặng cho chúng ta vô vàn chất liệu kì diệu! Một chiếc lá khô rơi, một mẩu len thừa đều có thể trở thành kiệt tác dưới bàn tay nghệ sĩ của các em.',
        fourSteps: [
          'Bước 1: Phác hình dáng ý tưởng lên giấy bìa cứng',
          'Bước 2: Lựa chọn lá cây, len sợi có hình dáng và màu sắc phù hợp',
          'Bước 3: Bôi keo dán nguội an toàn và đính kết vật liệu cẩn thận',
          'Bước 4: Dùng bút màu vẽ thêm chi tiết phụ kết nối bức tranh'
        ]
      },
      {
        id: 'g3_cd6',
        title: 'Chủ đề 6: Biết ơn thầy cô (Làm bưu thiếp & Tranh hoa tặng thầy cô)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Hiểu ý nghĩa ngày Nhà giáo Việt Nam 20-11 và nghệ thuật thiết kế thiệp chúc mừng.',
          skills: 'Cắt dán hoa nổi 3D, viết chữ nắn nót lời chúc tri ân gửi tặng thầy cô.',
          qualities: 'Lòng tôn sư trọng đạo, bày tỏ tình cảm biết ơn một cách chân thành.'
        },
        warmup: 'Hát bài "Thầy cô cho em mùa xuân" và thảo luận về món quà ý nghĩa nhất tặng thầy cô.',
        questions: [
          'Lời chúc nào em muốn viết nắn nót nhất gửi tới thầy cô kính yêu?',
          'Bông hoa hướng dương nở rộ trên tấm thiệp mang thông điệp tươi sáng gì?'
        ],
        teacherScript: 'Tấm thiệp nhỏ do chính đôi bàn tay các em nắn nót cắt dán chứa đựng biết bao tình cảm yêu thương. Thầy cô sẽ luôn trân quý món quà ấm áp này suốt cuộc đời!',
        fourSteps: [
          'Bước 1: Gấp đôi tờ giấy bìa màu tạo khung thiệp chữ nhật',
          'Bước 2: Cắt dán các bông hoa nhiều tầng nổi bật ở mặt trước thiệp',
          'Bước 3: Viết dòng chữ chúc mừng 20-11 cách điệu nắn nót',
          'Bước 4: Trang trí viền ren hoa lá và viết lời chúc yêu thương bên trong'
        ]
      },
      {
        id: 'g3_cd7',
        title: 'Chủ đề 7: Cảnh vật quanh em (Phong cảnh làng quê, góc phố)',
        genre: 'landscape',
        objectives: {
          knowledge: 'Quan sát và cảm nhận vẻ đẹp của con đường làng, cánh đồng lúa, góc phố thân thương.',
          skills: 'Dựng bố cục phong cảnh có đường chân trời, cây cối ở gần to rõ, dãy núi phía xa mờ ảo.',
          qualities: 'Gắn bó tha thiết với mảnh đất nơi mình sinh ra và lớn lên.'
        },
        warmup: 'Cho xem bức tranh phong cảnh đồng lúa chín vàng ươm dưới ráng chiều.',
        questions: [
          'Con đường làng uốn lượn nhỏ dần về phía chân trời thể hiện điều gì?',
          'Dòng sông xanh mát chảy qua ngôi làng mang lại cảm giác bình yên thế nào?'
        ],
        teacherScript: 'Quê hương mỗi người chỉ một, như là chỉ một mẹ thôi. Từng rặng dừa nghiêng bóng, từng mái ngói đỏ tươi đều đang chờ các em ghi lại bằng những nét cọ đượm tình!',
        fourSteps: [
          'Bước 1: Kẻ đường chân trời ở vị trí 1/3 tranh',
          'Bước 2: Vẽ con đường hoặc dòng sông uốn lượn từ cận cảnh ra viễn cảnh',
          'Bước 3: Thêm ngôi nhà mái ngói, rặng tre xanh và đàn cò bay lượn',
          'Bước 4: Tô màu tươi sáng: lúa vàng, trời xanh, ngói đỏ'
        ]
      },
      {
        id: 'g3_cd8',
        title: 'Chủ đề 8: Chân dung người thân trong gia đình',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Nắm vững tỉ lệ trục mắt, mũi, miệng và đặc điểm tuổi tác (tóc bạc của ông bà, nụ cười của cha mẹ).',
          skills: 'Vẽ chân dung bán thân của người thân thể hiện được tình cảm ấm áp qua ánh mắt.',
          qualities: 'Hiếu thảo với ông bà cha mẹ, trân trọng từng phút giây bên gia đình.'
        },
        warmup: 'Cho xem bức ảnh chân dung bà cụ móm mém cười hiền từ bên hiên nhà.',
        questions: [
          'Nếp nhăn nơi khóe mắt ông bà nói lên điều gì về những năm tháng hi sinh vì con cháu?',
          'Em muốn chọn gam màu ấm áp nào để tô nền tranh cho bức chân dung của mẹ?'
        ],
        teacherScript: 'Khuôn mặt hiền từ của bà, bàn tay thô ráp của cha là những hình ảnh đẹp đẽ nhất trần đời. Hãy vẽ lại chân dung người thân bằng tất cả trái tim yêu thương của các con!',
        fourSteps: [
          'Bước 1: Phác khuôn mặt hình oval và chia trục đối xứng dọc, ngang',
          'Bước 2: Xác định tỉ lệ: mắt ở đường giữa mặt, mũi ở khoảng cách 1/3, miệng ở 1/3 dưới',
          'Bước 3: Khắc họa đặc điểm riêng: nếp nhăn, kiểu tóc, gọng kính',
          'Bước 4: Lên màu da mềm mại và tô màu trang phục nhã nhặn'
        ]
      },
      {
        id: 'g3_cd9',
        title: 'Chủ đề 9: Sinh hoạt trong gia đình (Cùng làm việc nhà, vui chơi)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Khắc họa các hoạt động sinh hoạt sôi nổi: cùng gói bánh chưng, dọn dẹp nhà cửa, tưới cây.',
          skills: 'Vẽ dáng người đang vận động (cúi, nghiêng, với tay, xách nước) tự nhiên.',
          qualities: 'Có ý thức giúp đỡ cha mẹ việc nhà, vun đắp tình cảm gia đình hòa thuận.'
        },
        warmup: 'Diễn kịch câm: Một bạn làm động tác quét nhà, lau bàn để cả lớp cùng đoán.',
        questions: [
          'Khi cúi xuống quét nhà, lưng và chân uốn cong như thế nào?',
          'Cả nhà cùng nhau gói bánh chưng ngày Tết rộn rã tiếng cười ra sao?'
        ],
        teacherScript: 'Những khoảnh khắc cả nhà cùng chung tay làm việc nhà tuy giản dị nhưng ngập tràn hạnh phúc. Hãy tái hiện lại không khí đầm ấm, rộn ràng ấy trong tranh nhé!',
        fourSteps: [
          'Bước 1: Phác thảo không gian sinh hoạt: sân nhà, phòng khách hoặc gian bếp',
          'Bước 2: Dựng dáng người vận động: bố đang sửa quạt, mẹ nấu bếp, bé tưới cây',
          'Bước 3: Vẽ thêm đồ dùng sinh hoạt: chổi quét, xô nước, chậu hoa',
          'Bước 4: Tô màu tươi sáng, tạo không khí vui tươi rộn rã'
        ]
      },
      {
        id: 'g3_cd10',
        title: 'Chủ đề 10: An toàn giao thông (Em đi bộ an toàn, Đèn tín hiệu)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Nhận biết các quy tắc giao thông cơ bản: đi trên vỉa hè, qua đường theo vạch kẻ, tín hiệu đèn giao thông.',
          skills: 'Vẽ tranh tuyên truyền an toàn giao thông với cảnh học sinh qua đường có chú công an hỗ trợ.',
          qualities: 'Ý thức tự giác chấp hành luật giao thông, bảo vệ tính mạng cho bản thân và cộng đồng.'
        },
        warmup: 'Hát bài "Từ một ngã tư đường phố" kết hợp giơ thẻ đèn Đỏ - Vàng - Xanh.',
        questions: [
          'Khi đèn đỏ bật sáng, các phương tiện giao thông phải làm gì?',
          'Vạch kẻ trắng qua đường dành cho người đi bộ có hình dáng giống lưng con ngựa vằn không?'
        ],
        teacherScript: 'An toàn giao thông là hạnh phúc của mọi nhà! Bức tranh của các em hôm nay sẽ là lời nhắc nhở nhẹ nhàng nhưng đầy ý nghĩa gửi tới tất cả mọi người khi tham gia giao thông.',
        fourSteps: [
          'Bước 1: Vẽ ngã tư đường phố với cột đèn tín hiệu giao thông',
          'Bước 2: Vẽ vạch kẻ trắng qua đường và bạn nhỏ đang đi trên vạch',
          'Bước 3: Vẽ ô tô, xe máy dừng lại nghiêm túc trước vạch dừng',
          'Bước 4: Tô màu rực rỡ cho các phương tiện và đèn tín hiệu'
        ]
      }
    ],
    4: [
      {
        id: 'g4_cd1',
        title: 'Chủ đề 1: Vẻ đẹp trong điêu khắc đình làng Việt Nam',
        genre: 'craft_applied',
        objectives: {
          knowledge: 'Hiểu về nghệ thuật chạm khắc gỗ đình làng thế kỉ XVI - XVIII: mộc mạc, phóng khoáng, dí dỏm.',
          skills: 'Mô phỏng lại một bức chạm khắc rồng, tiên cưỡi rồng hoặc cảnh chèo thuyền dân gian.',
          qualities: 'Lòng tự hào về di sản kiến trúc cổ kính của làng quê Việt Nam.'
        },
        warmup: 'Cho xem bức ảnh chạm nổi "Đánh cờ", "Uống rượu" ở đình làng Tây Đằng.',
        questions: [
          'Nét chạm đục trên gỗ mang lại cảm giác gồ ghề, khỏe khoắn như thế nào?',
          'Hình tượng con rồng thời Lê có nét gì ngộ nghĩnh, gần gũi với người nông dân?'
        ],
        teacherScript: 'Đình làng không chỉ là mái nhà chung của cộng đồng làng xã mà còn là bảo tàng điêu khắc gỗ tuyệt mĩ của ông cha ta. Từng nhát đục đều thấm đẫm tâm hồn phóng khoáng của người thợ tài hoa!',
        fourSteps: [
          'Bước 1: Phác khung hình dáng nhân vật chạm khắc cổ kính',
          'Bước 2: Dùng nét viền đậm tạo phong cách chạm khắc nổi',
          'Bước 3: Sử dụng gam màu nâu gỗ, vàng đất, đỏ son trầm ấm',
          'Bước 4: Tạo hiệu ứng vân gỗ và vết nứt rạn cổ kính'
        ]
      },
      {
        id: 'g4_cd2',
        title: 'Chủ đề 2: Một số dạng không gian trong tranh dân gian Việt Nam (Đông Hồ, Hàng Trống)',
        genre: 'general',
        objectives: {
          knowledge: 'Hiểu không gian đồng hiện và ước lệ trong tranh dân gian: không gian không theo luật xa gần phương Tây.',
          skills: 'Vẽ mô phỏng tranh "Lợn đàn", "Gà đại cát" hoặc "Đám cưới chuột" với nét viền đen dứt khoát.',
          qualities: 'Trân trọng nghệ thuật in tranh khắc gỗ truyền thống, gìn giữ phong vị Tết xưa.'
        },
        warmup: 'Chiếu tranh "Lợn ăn cây ráy" và đố học sinh tìm xoáy âm dương trên mình chú lợn.',
        questions: [
          'Vì sao giấy điệp tranh Đông Hồ lại lấp lánh như vỏ sò biển?',
          'Màu đen trong tranh dân gian được làm từ than lá tre mịn màng ra sao?'
        ],
        teacherScript: 'Tranh Đông Hồ gà lợn nét tươi trong / Màu dân tộc sáng bừng trên điệp điệp. Từng đường nét mộc mạc ấy chính là hồn quê hương ngàn năm sống mãi!',
        fourSteps: [
          'Bước 1: Phác hình dáng con vật dân gian khỏe khoắn, ngộ nghĩnh',
          'Bước 2: Vẽ nét viền đen đậm dứt khoát như nét khắc gỗ',
          'Bước 3: Tô màu mảng phẳng bằng các màu tự nhiên: vàng hoa hòe, đỏ gạch, xanh chàm',
          'Bước 4: Trang trí xoáy âm dương và hoa cỏ dân gian phụ trợ'
        ]
      },
      {
        id: 'g4_cd3',
        title: 'Chủ đề 3: Cảnh đẹp quê hương (Luật xa gần, đường tầm mắt)',
        genre: 'landscape',
        objectives: {
          knowledge: 'Ứng dụng luật xa gần: đường chân trời, điểm tụ, vật ở gần to - rõ - đậm, vật ở xa nhỏ - mờ - nhạt.',
          skills: 'Dựng phối cảnh con đường làng, rặng núi xa hoặc vịnh Hạ Long có chiều sâu thấu thị rõ rệt.',
          qualities: 'Cảm nhận sự bao la, hùng vĩ của non sông gấm vóc Việt Nam.'
        },
        warmup: 'Cho xem bức ảnh chụp con đường ray xe lửa hội tụ về một điểm ở phía chân trời.',
        questions: [
          'Điểm tụ nằm ở đâu trên đường chân trời?',
          'Vì sao rặng núi ở xa tít lại chuyển thành màu xanh lam nhạt mờ ảo?'
        ],
        teacherScript: 'Bằng chiếc chìa khóa mang tên "Luật xa gần", các em có thể mở tung bốn góc giấy phẳng để đón cả một chân trời bao la tít tắp vào lòng bức tranh!',
        fourSteps: [
          'Bước 1: Xác định đường tầm mắt (chân trời) và điểm tụ trung tâm',
          'Bước 2: Phác các đường gióng dẫn hướng từ cận cảnh về điểm tụ',
          'Bước 3: Dựng cây cối, nhà cửa giảm dần kích thước theo khoảng cách xa gần',
          'Bước 4: Lên màu: Cận cảnh dùng màu nóng rực rỡ, viễn cảnh dùng màu lạnh nhạt dần'
        ]
      },
      {
        id: 'g4_cd4',
        title: 'Chủ đề 4: Vẻ đẹp trong cuộc sống (Đồ dùng quen thuộc & Góc học tập)',
        genre: 'still_life',
        objectives: {
          knowledge: 'Khám phá sự hài hòa về công năng và thẩm mĩ của các đồ gia dụng quen thuộc.',
          skills: 'Vẽ cụm đồ vật gồm bình hoa, cốc nước, cuốn sách có sự liên kết không gian chặt chẽ.',
          qualities: 'Sắp xếp góc học tập ngăn nắp, biết trân trọng đồ dùng học tập cha mẹ sắm cho.'
        },
        warmup: 'Cho học sinh sắp xếp 3 đồ vật trên bàn giáo viên để tìm bố cục đẹp mắt nhất.',
        questions: [
          'Chiếc bình gốm bóng loáng phản chiếu ánh sáng cửa sổ như thế nào?',
          'Bố cục tam giác mang lại cảm giác vững chãi, cân bằng cho bức tranh ra sao?'
        ],
        teacherScript: 'Cái đẹp không ở đâu xa, cái đẹp đang ẩn mình ngay trong chiếc đèn bàn thân thuộc, trang sách mở ra đón ánh nắng mai. Hãy cùng thầy/cô ghi lại khoảnh khắc bình yên ấy!',
        fourSteps: [
          'Bước 1: Sắp xếp mẫu vật có vật cao, vật thấp, vật đứng trước che vật đứng sau',
          'Bước 2: Phác khung hình tổng thể và kẻ trục đối xứng từng đồ vật',
          'Bước 3: Vẽ chi tiết miệng bình, quai cốc, gáy sách chính xác',
          'Bước 4: Đánh bóng tạo chất cảm gốm, sứ, giấy và đổ bóng mặt bàn'
        ]
      },
      {
        id: 'g4_cd5',
        title: 'Chủ đề 5: Những kỉ niệm đẹp (Kỉ niệm mùa hè, Sinh hoạt bè bạn)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Khắc họa các chuyến tham quan du lịch, tắm biển, cắm trại hoặc thả diều trên đê.',
          skills: 'Vẽ bố cục nhiều nhân vật với các tư thế vận động đa dạng, cảm xúc phấn khởi rạng ngời.',
          qualities: 'Lưu giữ những kí ức tuổi thơ tươi đẹp, trân quý tình bạn bè trong sáng.'
        },
        warmup: 'Mỗi bạn kể lại 1 kỉ niệm đáng nhớ nhất trong kì nghỉ hè vừa qua.',
        questions: [
          'Cánh diều no gió bay vút lên bầu trời xanh biếc làm em thấy sảng khoái ra sao?',
          'Nụ cười của nhóm bạn khi cùng nhau xây lâu đài cát bên bờ biển thế nào?'
        ],
        teacherScript: 'Tuổi thơ trôi qua như một giấc mơ thần tiên. Những chuyến đi, những buổi chiều thả diều lộng gió sẽ mãi là viên ngọc sáng trong tâm hồn các em. Hãy lưu giữ chúng qua nét vẽ nhé!',
        fourSteps: [
          'Bước 1: Chọn một kỉ niệm sâu sắc nhất làm đề tài trung tâm',
          'Bước 2: Phác nhóm bạn nhỏ đang vui đùa với nhiều tư thế chạy nhảy sinh động',
          'Bước 3: Dựng cảnh nền: bãi biển rì rào, cánh đồng thả diều lộng gió',
          'Bước 4: Tô màu rực rỡ, tươi vui phản ánh năng lượng tràn đầy của tuổi trẻ'
        ]
      },
      {
        id: 'g4_cd6',
        title: 'Chủ đề 6: Mái trường yêu dấu (Hoạt động giờ ra chơi, Giờ học nhóm)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Quan sát không gian trường tiểu học: sân trường rợp bóng cây bàng, dãy phòng học, cột cờ.',
          skills: 'Vẽ nhóm học sinh đang nhảy dây, đá cầu, đọc sách dưới gốc cây bàng.',
          qualities: 'Tình cảm gắn bó với ngôi trường, biết giữ gìn vệ sinh và bảo vệ của công.'
        },
        warmup: 'Cho nghe tiếng trống trường điểm giờ ra chơi giòn giã "Tùng! Tùng! Tùng!".',
        questions: [
          'Tán lá bàng mùa hè xòe rộng như chiếc ô khổng lồ che mát cho các em vui chơi ra sao?',
          'Vòng tròn các bạn đang chơi nhảy dây tạo nên nhịp điệu chuyển động thế nào?'
        ],
        teacherScript: 'Mỗi ngày đến trường là một ngày vui! Sân trường rộn rã tiếng cười đùa, từng góc lớp thân thương đều in dấu bước chân tuổi thơ của các em. Hãy vẽ nên bức tranh mái trường mến yêu!',
        fourSteps: [
          'Bước 1: Dựng không gian trường học: dãy hành lang lớp học, cột cờ và cây bàng lớn',
          'Bước 2: Vẽ các nhóm học sinh chơi đá cầu, nhảy dây, đọc sách',
          'Bước 3: Vẽ chi tiết khăn quàng đỏ bay trong gió, đồng phục trắng tinh',
          'Bước 4: Tô màu nắng vàng rực rỡ chiếu qua kẽ lá xuống sân trường'
        ]
      },
      {
        id: 'g4_cd7',
        title: 'Chủ đề 7: Môi trường xanh – sạch – đẹp (Trồng cây, Thu gom rác thải)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Hiểu tầm quan trọng của việc bảo vệ cây xanh, giữ gìn nguồn nước và phân loại rác thải.',
          skills: 'Vẽ tranh cổ động hoặc tranh sinh hoạt thể hiện hành động cụ thể bảo vệ môi trường.',
          qualities: 'Nâng cao ý thức sinh thái, sẵn sàng chung tay vì một Trái Đất xanh tươi.'
        },
        warmup: 'Xem hình ảnh đối lập: Một bên bãi biển ngập rác, một bên biển xanh trong vắt không một cọng rác.',
        questions: [
          'Hành động tưới nước cho mầm cây mới nhú mang lại thông điệp gì cho tương lai?',
          'Những thùng rác phân loại (hữu cơ, vô cơ) nên sơn màu gì để người dân dễ nhận biết?'
        ],
        teacherScript: 'Hành tinh xanh nằm trong đôi bàn tay nhỏ bé của chúng ta. Mỗi mầm cây được trồng, mỗi mẩu rác được nhặt lên là một lời hứa với tương lai tươi sáng!',
        fourSteps: [
          'Bước 1: Chọn hành động ý nghĩa: nhóm bạn trồng cây xanh hoặc dọn rác bờ biển',
          'Bước 2: Phác dáng người đang cúi cuốc đất, xách xô nước, nhặt rác',
          'Bước 3: Vẽ thêm khung cảnh thiên nhiên tươi đẹp xung quanh: mây trắng, chim bay',
          'Bước 4: Sử dụng gam màu xanh lá, xanh da trời chủ đạo mang thông điệp xanh'
        ]
      },
      {
        id: 'g4_cd8',
        title: 'Chủ đề 8: Quê hương thanh bình (Làng quê, Đầm sen, Thuyền câu)',
        genre: 'landscape',
        objectives: {
          knowledge: 'Cảm nhận vẻ đẹp tĩnh lặng, êm đềm của vùng thôn dã Việt Nam.',
          skills: 'Sử dụng màu nước hoặc sáp dầu loang màu mềm mại thể hiện mặt nước hồ sen, ráng chiều.',
          qualities: 'Tâm hồn phong phú, biết trân quý những nét đẹp bình dị, thanh tao của non nước.'
        },
        warmup: 'Cho nghe khúc ngâm thơ "Tháp Mười đẹp nhất bông sen" và tiếng sáo trúc văng vẳng.',
        questions: [
          'Sắc hồng của cánh sen hòa quyện với sắc xanh biếc của lá sen tạo nên vẻ đẹp thuần khiết ra sao?',
          'Chiếc thuyền nan khẽ lướt trên mặt sông phẳng lặng như tờ mang lại cảm giác gì?'
        ],
        teacherScript: 'Giữa cuộc sống hiện đại bộn bề, một góc quê thanh bình với đầm sen tỏa hương ngào ngạt sẽ xua tan mọi mỏi mệt. Hãy để tâm hồn mình lắng đọng cùng sắc màu quê hương!',
        fourSteps: [
          'Bước 1: Kẻ đường bờ đầm và chân núi mờ xa phía chân trời',
          'Bước 2: Phác những chiếc lá sen to tròn nổi trên mặt nước và những đóa sen vươn cao',
          'Bước 3: Thêm chú chim bói cá đậu trên cành sen hoặc chiếc cầu khỉ nhỏ',
          'Bước 4: Loang màu nước mềm mại cho bầu trời hoàng hôn và mặt nước lung linh'
        ]
      }
    ],
    5: [
      {
        id: 'g5_cd1',
        title: 'Chủ đề 1: Yếu tố tạo hình trong thực hành, sáng tạo theo chủ đề (Chữ trang trí & Poster cổ động)',
        genre: 'craft_applied',
        objectives: {
          knowledge: 'Hiểu mối quan hệ chặt chẽ giữa hình tượng thị giác và chữ thông điệp trong đồ họa ứng dụng.',
          skills: 'Thiết kế một poster cổ động (Bảo vệ môi trường, An toàn giao thông, Đọc sách) súc tích.',
          qualities: 'Tinh thần trách nhiệm công dân, tự tin cất lên tiếng nói lan tỏa điều tử tế.'
        },
        warmup: 'So sánh 2 poster: Một cái rối rắm nhiều chữ, một cái hình ảnh biểu tượng đập mạnh vào mắt người xem.',
        questions: [
          'Biểu tượng bàn tay nâng niu mầm cây xanh mang ý nghĩa truyền thông mạnh mẽ như thế nào?',
          'Kiểu chữ in hoa nét dày dặn, góc cạnh tạo nên sự dứt khoát, thúc giục hành động ra sao?'
        ],
        teacherScript: 'Các em đã là học sinh Lớp 5 - anh chị cả của trường tiểu học! Giờ đây mĩ thuật không chỉ để chiêm ngưỡng mà còn là tiếng nói mạnh mẽ để thay đổi thế giới xung quanh!',
        fourSteps: [
          'Bước 1: Xác định thông điệp cốt lõi ngắn gọn (3-5 từ) và hình tượng biểu trưng',
          'Bước 2: Phác hình ảnh biểu tượng ở vị trí trọng tâm thu hút thị giác',
          'Bước 3: Dựng hàng chữ khẩu hiệu ngay ngắn, tương phản màu sắc với nền',
          'Bước 4: Sử dụng các mảng màu mạnh mẽ (đỏ, vàng, xanh thẫm) tạo sức thuyết phục'
        ]
      },
      {
        id: 'g5_cd2',
        title: 'Chủ đề 2: Hình tượng anh hùng dân tộc trong mĩ thuật tạo hình Việt Nam',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Khám phá hình tượng các vị anh hùng lịch sử (Hai Bà Trưng, Ngô Quyền, Trần Hưng Đạo, Bác Hồ) trong tranh và tượng đài.',
          skills: 'Vẽ chân dung hoặc hoạt cảnh lịch sử tái hiện khí phách hào hùng của danh tướng Việt Nam.',
          qualities: 'Lòng yêu nước nồng nàn, niềm tự hào sâu sắc về truyền thống chống giặc ngoại xâm của dân tộc.'
        },
        warmup: 'Chiếu bức tượng đài Vua Quang Trung cưỡi ngựa hoặc Hai Bà Trưng cưỡi voi ra trận.',
        questions: [
          'Dáng đứng kiên cường, ánh mắt quắc thước của vị tướng thể hiện dũng khí cứu nước như thế nào?',
          'Cờ đỏ bay phần phật và sóng gió Bạch Đằng giang gợi nhắc chiến công oanh liệt nào?'
        ],
        teacherScript: 'Non sông Việt Nam ngàn năm dựng nước và giữ nước đã tạc nên những tượng đài bất tử. Từng nét vẽ hôm nay sẽ là nén tâm nhang tri ân tiền nhân anh dũng!',
        fourSteps: [
          'Bước 1: Phác dáng nhân vật anh hùng ở thế chuyển động oai phong (cưỡi ngựa, vung kiếm, chỉ huy)',
          'Bước 2: Khắc họa gương mặt cương nghị, áo giáp, mũ sắt hoặc áo bà ba truyền thống',
          'Bước 3: Vẽ phối cảnh nền: cờ khởi nghĩa, sóng nước cuồn cuộn hoặc núi non hùng vĩ',
          'Bước 4: Lên màu hào hùng với các gam màu trầm ấm, rực rỡ ngọn lửa yêu nước'
        ]
      },
      {
        id: 'g5_cd3',
        title: 'Chủ đề 3: Gia đình (Tình cảm gia đình, Bữa cơm ấm áp, Chăm sóc ông bà cha mẹ)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Cảm nhận sâu sắc giá trị thiêng liêng của mái ấm gia đình: tình yêu thương, sự chở che của cha mẹ, sự kính trọng ông bà.',
          skills: 'Vẽ tranh sinh hoạt gia đình có bố cục nhiều nhân vật, phối hợp dáng điệu ngồi, đứng, trò chuyện gắn kết yêu thương.',
          qualities: 'Hiếu thảo, biết ơn công lao sinh thành dưỡng dục, biết chia sẻ buồn vui cùng người thân.'
        },
        warmup: 'Kể về một kỉ niệm ấm áp nhất bên gia đình: một buổi tối sinh nhật, lúc bố dạy học bài, hoặc cả nhà cùng nhau nấu ăn.',
        questions: [
          'Khuôn mặt rạng rỡ của mẹ khi được em tặng điểm 10 hay giúp mẹ nhặt rau như thế nào?',
          'Ánh mắt âu yếm của người cha khi ôm con vào lòng mang lại cảm giác bình yên ra sao?',
          'Em muốn dùng gam màu vàng ấm hay cam dịu để thể hiện không khí sum vầy của cả nhà?'
        ],
        teacherScript: 'Gia đình là bến đỗ bình yên nhất của cuộc đời mỗi con người. Nơi ấy có ánh mắt bao dung của mẹ, bờ vai vững chãi của cha và vòng tay ấm áp của ông bà. Hãy gửi trọn tình yêu thương ấy vào từng nét vẽ hôm nay nhé!',
        fourSteps: [
          'Bước 1: Xác định hoạt động gia đình (bữa cơm tối, cả nhà xem tivi, cùng chăm sóc cây) và phác vị trí các nhân vật',
          'Bước 2: Vẽ chi tiết các thành viên: bố mẹ cao lớn chở che, các con nhỏ nhắn vui tươi, ông bà hiền từ',
          'Bước 3: Thể hiện cảm xúc gương mặt rạng rỡ, ánh mắt yêu thương và sự tương tác giữa các thành viên',
          'Bước 4: Tô màu với tông màu ấm áp (vàng kem, cam ấm, hồng phấn) tạo không gian gia đình chan chứa yêu thương'
        ]
      },
      {
        id: 'g5_cd4',
        title: 'Chủ đề 4: Những hoạt động yêu thích ở trường em',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Quan sát các hoạt động ngoại khóa, hội thao, biểu diễn văn nghệ, câu lạc bộ mĩ thuật tại trường.',
          skills: 'Vẽ tranh toàn cảnh ngày hội trường với nhiều nhóm nhân vật chuyển động nhịp nhàng.',
          qualities: 'Yêu trường mến lớp, hào hứng tham gia các hoạt động tập thể rèn luyện kĩ năng sống.'
        },
        warmup: 'Cho xem clip ngắn ngày hội thể thao kéo co, nhảy bao bố rộn vang tiếng cổ vũ.',
        questions: [
          'Tư thế rạp người ngả về sau khi cả đội cùng dồn sức kéo sợi dây thừng thế nào?',
          'Chiếc cờ hoa và băng rôn cổ vũ làm sân trường bừng sáng niềm vui ra sao?'
        ],
        teacherScript: 'Những ngày tháng cuối cùng của bậc tiểu học đang dần trôi qua. Từng giờ sinh hoạt tập thể, từng cuộc thi văn nghệ sẽ là hành trang kỉ niệm quý giá theo các em mãi mãi!',
        fourSteps: [
          'Bước 1: Phác bố cục sân trường với khán đài hoặc sân khấu chính',
          'Bước 2: Dựng các nhóm nhân vật tham gia thi đấu thể thao hoặc múa hát',
          'Bước 3: Thêm các bạn cổ động viên giơ cờ hoa cổ vũ náo nhiệt',
          'Bước 4: Phối màu sắc sôi nổi, năng động phản ánh khí thế thi đua'
        ]
      },
      {
        id: 'g5_cd5',
        title: 'Chủ đề 5: Những việc làm bình dị mà cao quý trong cuộc sống',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Nhận biết vẻ đẹp của người lao động thầm lặng: bác nông dân dầm mưa dãi nắng, cô lao công quét rác đêm khuya, chú cảnh sát giữ bình yên.',
          skills: 'Khắc họa chân dung người lao động trong tư thế làm việc tận tụy, tự hào.',
          qualities: 'Tôn trọng mọi ngành nghề chân chính, trân quý mồ hôi nước mắt của người lao động.'
        },
        warmup: 'Đố vui về các nghề nghiệp: Ai thức dậy sớm nhất quét sạch từng con phố đón bình minh?',
        questions: [
          'Bàn tay chai sạn và giọt mồ hôi lăn trên má bác nông dân nói lên điều gì về hạt gạo em ăn?',
          'Tấm áo phản quang của cô lao công sáng lên trong đêm tối mang lại sự ấm lòng ra sao?'
        ],
        teacherScript: 'Không có nghề nghiệp nào là thấp hèn, chỉ có những việc làm cống hiến cho đời là cao quý nhất! Từng nhát chổi đêm khuya, từng giọt mồ hôi trên đồng đều xứng đáng được tôn vinh như những bông hoa đẹp!',
        fourSteps: [
          'Bước 1: Chọn một nhân vật lao động em kính trọng nhất (bác sĩ, công an, lao công, nông dân)',
          'Bước 2: Phác dáng người đang miệt mài làm việc với trang phục và dụng cụ đặc thù',
          'Bước 3: Khắc họa nét mặt tận tụy, ánh mắt ấm áp đầy trách nhiệm',
          'Bước 4: Lên màu trung thực, tạo chiều sâu ánh sáng tôn vinh vẻ đẹp lao động'
        ]
      },
      {
        id: 'g5_cd6',
        title: 'Chủ đề 6: Cảnh sắc quê hương (Non nước Việt Nam, Di sản thiên nhiên)',
        genre: 'landscape',
        objectives: {
          knowledge: 'Khám phá các danh thắng nổi tiếng: ruộng bậc thang Mù Cang Chải, hang động Phong Nha, vịnh Hạ Long, sông nước miền Tây.',
          skills: 'Vận dụng thuần thục luật phối cảnh, tương phản sáng tối và hòa sắc thiên nhiên kì vĩ.',
          qualities: 'Tự hào về vẻ đẹp gấm vóc của Tổ quốc, ý thức bảo tồn di sản thiên nhiên.'
        },
        warmup: 'Chiếu video toàn cảnh ruộng bậc thang Tây Bắc mùa lúa chín vàng óng ả.',
        questions: [
          'Những dải ruộng bậc thang uốn lượn quanh sườn núi giống như những nấc thang lên trời thế nào?',
          'Màu xanh ngọc bích của nước vịnh Hạ Long kết hợp với những đảo đá vôi tạo nên bức tranh thủy mặc ra sao?'
        ],
        teacherScript: 'Đất nước Việt Nam từ non cao Tây Bắc đến đồng bằng Nam Bộ đều là những tuyệt tác thiên nhiên rực rỡ. Hãy cùng nhau vẽ nên bức tranh non sông cẩm tú ngàn đời!',
        fourSteps: [
          'Bước 1: Dựng bố cục đường chân trời và các tầng lớp không gian núi non hùng vĩ',
          'Bước 2: Phác các đường cong uốn lượn của ruộng bậc thang hoặc dãy núi đá vôi',
          'Bước 3: Thêm nét sinh hoạt con người nhỏ bé giữa thiên nhiên: chiếc thuyền nan, người gặt lúa',
          'Bước 4: Lên màu tinh tế với sắc độ chuyển tiếp phong phú từ đậm đến nhạt'
        ]
      },
      {
        id: 'g5_cd7',
        title: 'Chủ đề 7: Việt Nam đất nước, con người (Lễ hội truyền thống & Văn hóa dân gian)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Tìm hiểu không khí tưng bừng của lễ hội truyền thống: hội đua thuyền, hội chọi trâu, hội cồng chiêng Tây Nguyên, múa lân sư rồng.',
          skills: 'Thể hiện bố cục đông người náo nhiệt với trang phục lễ hội sặc sỡ và đạo cụ phong phú.',
          qualities: 'Bảo tồn và phát huy các giá trị văn hóa phi vật thể của dân tộc Việt Nam.'
        },
        warmup: 'Cho nghe tiếng trống hội cồng chiêng Tây Nguyên và tiếng chiêng trống múa lân rộn rã.',
        questions: [
          'Đầu lân rực rỡ sắc đỏ vàng đang uốn lượn mang lại lời chúc may mắn gì cho mọi nhà?',
          'Tiếng reo hò cổ vũ đoàn đua thuyền trên sông quê náo nhiệt như thế nào?'
        ],
        teacherScript: 'Lễ hội quê hương là nơi hội tụ tinh hoa văn hóa và tình đoàn kết của dân tộc. Bức tranh lễ hội hôm nay sẽ tràn ngập sắc màu may mắn, niềm vui và niềm tự hào nguồn cội!',
        fourSteps: [
          'Bước 1: Phác bố cục đoàn rước lễ hoặc hoạt cảnh lễ hội chính ở trung tâm',
          'Bước 2: Vẽ chi tiết các nhân vật múa lân, đánh trống, chèo thuyền với dáng chuyển động mạnh mẽ',
          'Bước 3: Thêm cờ hội ngũ sắc, lồng đèn và dòng người trẩy hội đông vui',
          'Bước 4: Sử dụng gam màu rực rỡ (đỏ, vàng, cam, lam) thể hiện không khí tưng bừng'
        ]
      },
      {
        id: 'g5_cd8',
        title: 'Chủ đề 8: Vì một thế giới hoà bình (Trẻ em năm châu nắm tay, Chim bồ câu trắng)',
        genre: 'portrait_human',
        objectives: {
          knowledge: 'Hiểu giá trị vô giá của hòa bình, tình hữu nghị giữa các dân tộc trên toàn cầu.',
          skills: 'Vẽ biểu tượng chim bồ câu trắng ngậm cành ô-liu, trẻ em năm châu da trắng, da vàng, da đen cùng nắm tay quanh Trái Đất.',
          qualities: 'Lòng nhân ái, ước vọng hòa bình, tình đoàn kết quốc tế không phân biệt biên giới.'
        },
        warmup: 'Hát bài "Trái Đất này là của chúng mình" và chuyền tay nhau quả địa cầu nhỏ.',
        questions: [
          'Cánh chim bồ câu trắng chao liệng trên bầu trời xanh mang thông điệp bình yên gì?',
          'Khi trẻ em năm châu cùng nắm chặt tay nhau, Trái Đất sẽ mỉm cười rạng rỡ ra sao?'
        ],
        teacherScript: 'Dù ở màu da nào, tiếng nói nào, tất cả trẻ em trên thế giới đều cùng chung một ước mơ: được sống trong hòa bình, được cắp sách tới trường dưới bầu trời xanh không bom đạn!',
        fourSteps: [
          'Bước 1: Vẽ quả địa cầu hình tròn ở trung tâm bức tranh',
          'Bước 2: Vẽ các bạn nhỏ nhiều màu da cùng nắm tay nhau tạo thành vòng tròn bao quanh',
          'Bước 3: Thêm cánh chim bồ câu trắng bay lượn và dải cầu vồng rực rỡ',
          'Bước 4: Tô màu tươi sáng: biển xanh hòa bình, cờ hoa rực rỡ và nụ cười rạng ngời'
        ]
      }
    ]
  }
};
