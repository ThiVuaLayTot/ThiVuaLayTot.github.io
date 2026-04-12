let tournaments = [];
            let selectedEvent = null;

            const API_URL = 'https://script.google.com/macros/s/AKfycbzMq-aqPlXihBjjC62ykxbaWqC8sL30Wn0uvpjzIeLLpVYFsVXubYhujNbkDudgeMZ0Aw/exec';
            // Initialize
            window.addEventListener('DOMContentLoaded', () => {
   loadTournaments();
            });

            // Load tournaments
            async function loadTournaments() {
   try {
       const response = await fetch(API_URL);
       const data = await response.json();

       tournaments = data.tournaments || [];

       document.getElementById('loading').style.display = 'none';

       if (tournaments.length === 0) {
           document.getElementById('empty').style.display = 'block';
       } else {
           document.getElementById('calendar-wrapper').style.display = 'block';
           renderCalendar();
       }
   } catch (error) {
       console.error('Error:', error);
       document.getElementById('loading').style.display = 'none';
       document.getElementById('error').style.display = 'block';
       document.getElementById('error').innerHTML =
           `<div class="error"><i class="fas fa-exclamation-circle"></i> Lỗi: ${error.message}</div>`;
   }
            }

            // Render calendar
            function renderCalendar() {
   const today = new Date();
   const year = today.getFullYear();
   const month = today.getMonth();

   // Update header
   const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
   document.getElementById('month-title').textContent = `${monthNames[month]}/${year}`;

   // Get first day
   const firstDay = new Date(year, month, 1).getDay();
   const startDay = firstDay === 0 ? 6 : firstDay - 1;

   const daysInMonth = new Date(year, month + 1, 0).getDate();
   const daysInPrevMonth = new Date(year, month, 0).getDate();

   // Create days array
   const days = [];

   for (let i = startDay - 1; i >= 0; i--) {
       days.push({
           day: daysInPrevMonth - i,
           isCurrentMonth: false
       });
   }

   for (let i = 1; i <= daysInMonth; i++) {
       days.push({
           day: i,
           isCurrentMonth: true
       });
   }

   const remainingDays = 42 - days.length;
   for (let i = 1; i <= remainingDays; i++) {
       days.push({
           day: i,
           isCurrentMonth: false
       });
   }

   // Render table
   const tbody = document.getElementById('calendar-body');
   tbody.innerHTML = '';

   for (let i = 0; i < days.length; i += 7) {
       const tr = document.createElement('tr');

       for (let j = 0; j < 7; j++) {
           const dayObj = days[i + j];
           const td = document.createElement('td');

           if (!dayObj.isCurrentMonth) {
  td.classList.add('other-month');
           }

           // Check if today
           if (dayObj.isCurrentMonth &&
  today.getFullYear() === year &&
  today.getMonth() === month &&
  today.getDate() === dayObj.day) {
  td.classList.add('today');
           }

           // Day number
           const dayNum = document.createElement('span');
           dayNum.className = 'day-number';
           dayNum.textContent = dayObj.day;
           td.appendChild(dayNum);

           // Events container
           const eventsDiv = document.createElement('div');
           eventsDiv.className = 'events-container';

           if (dayObj.isCurrentMonth) {
  const dayTournaments = tournaments.filter(t => {
      const tDate = new Date(t.startTime);
      return tDate.getFullYear() === year &&
          tDate.getMonth() === month &&
          tDate.getDate() === dayObj.day;
  });

  dayTournaments.forEach(tournament => {
      const icon = document.createElement('span');
      icon.className = 'event-icon';

      const img = document.createElement('img');
      img.src = tournament.logo || 'https://chess.com/bundles/web/images/image-default.445cb543.svg';
      img.title = tournament.eventName || 'Tournament';
      img.onclick = (e) => {
          e.stopPropagation();
          openModal(tournament);
      };

      icon.appendChild(img);
      eventsDiv.appendChild(icon);
  });
           }

           td.appendChild(eventsDiv);
           tr.appendChild(td);
       }

       tbody.appendChild(tr);
   }
            }

            // Modal
            function openModal(tournament) {
   selectedEvent = tournament;
   const tournamentType = tournament.eventType;
   let bannerUrl = tournament.bannerLink || "https://chess.com/bundles/web/images/404-pawn.f17f262c.gif";
   let newsUrl = "";
   let resultUrl = "";
   if (tournamentType === "1wl") {
       newsUrl = "https://chess.com/clubs/forum/view/multi-club-arena-seasons-2026";
       bannerUrl = "https://images.chesscomfiles.com/uploads/v1/blog/1036746.ca7cfdc5.668x375o.1821c106decb.jpg";
       resultUrl = "https://chess.com/blog/OneWorldLeague";
   } else if (["cttq", "tvlt", "cbtt", "dttv"].includes(tournamentType)) {
       resultUrl = `/events/tournaments/${tournamentType}`;
       const eventInfo = {
           "tvlt": "/events/tvlt-thi-vua-lay-tot",
           "cttq": "/events/cttq-chien-truong-thi-quan",
           "cbtt": "/events/cbtt-co-bi-thi-tot",
           "dttv": "/events/tournaments/dttv"
       };
       const bannerDefault = {
           "tvlt": "/images/events/sieu-giai-thi-vua-lay-tot.png",
           "cttq": "/images/events/giai-chien-truong-thi-quan.png",
           "cbtt": "/images/events/su-kien-co-bi-thi-tot.png",
           "dttv": "/images/events/dau-truong-thi-vua.png"
       };
       bannerUrl = tournament.bannerLink || bannerDefault[tournamentType];
       newsUrl = tournament.newsLink || eventInfo[tournamentType];
   } else {
       resultUrl = `https://chess.com/clubs/events/thi-vua-lay-tot-tungjohn-playing-chess?cid=325849&ref_id=89365835&type=${tournamentType}`;
       const bannerDefault = {
           "club-arena": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpjs58p98gfqbbaDynSFJ.png",
           "multi-club-arena": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/php4oaq7r23q7n79I3kRE6.png",
           "swiss": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/VN-SenJin/phpt9ef43prdg6f80YfkLo.png",
           "vote": "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/M-DinhHoangViet/php8s3ooliju70kciI1yut.png",
           "daily": "https://images.chesscomfiles.com/uploads/v1/chess_term/f1e3ca50-b739-11ea-a14a-a1c9be904231.1fc2467a.630x354o.73dd2efd0681.png"
       };
       const eventDetails = {
           "club-arena": "https://support.chess.com/articles/8562889-what-are-arena-tournaments",
           "swiss": "https://chess.com/terms/swiss-chess",
           "vote": "https://support.chess.com/articles/8614177-how-do-i-play-vote-chess",
           "daily": "https://chess.com/terms/correspondence-chess",
           "multi-club-arena": "https://support.chess.com/articles/8562889-what-are-arena-tournaments"
       };
       bannerUrl = tournament.bannerLink || bannerDefault[tournamentType] || "https://chess.com/bundles/web/images/404-pawn.f17f262c.gif";
       newsUrl = tournament.newsLink || eventDetails[tournamentType] || "https://support.chess.com";
   }
   document.getElementById('modal-name').innerHTML = `<a href="${tournament.joinLink}">${tournament.eventName || 'Chi tiết giải đấu'}</a>`;
   document.getElementById('modal-category').textContent = tournament.prize || 'Giao lưu';
   document.getElementById('modal-organizer').innerHTML = tournament.organizer || 'Quản trị viên';

   const date = new Date(tournament.startTime);
   document.getElementById('modal-time').innerText = date.toLocaleString('vi-VN');
   document.getElementById('modal-game-rules').textContent = tournament.gameRules || 'Chưa có thông tin';
   document.getElementById('modal-event-rules').textContent = tournament.eventRules || 'Chưa có thông tin';

   document.getElementById('modal-logo').src = tournament.logo;
   document.getElementById('modal-banner').src = bannerUrl;

   const joinLink = document.getElementById('modal-join');
   const ruleLink = document.getElementById('modal-rule');
   const resultLink = document.getElementById('modal-results');

   ruleLink.href = newsUrl || '#';
   resultLink.href = resultUrl || '#';
   if (tournament.joinLink) {
       joinLink.href = tournament.joinLink;
       joinLink.onclick = null; // Remove any previous click handler
   } else {
       joinLink.href = '#';
       joinLink.onclick = function(e) {
           e.preventDefault();
           alert('Hiện chưa có link giải, hãy hỏi các quản trị viên hoặc người tổ chức giải này để tìm hiểu thêm!');
           return false;
       };
   }

   const modal = document.getElementById('eventModal');
   modal.classList.add('open');
   modal.setAttribute('aria-hidden', 'false');
   document.body.style.overflow = 'hidden';
   selectedEvent = tournament;
            }

            function closeModal() {
   const modal = document.getElementById('eventModal');
   modal.classList.remove('open');
   modal.setAttribute('aria-hidden', 'true');
   document.body.style.overflow = '';
   selectedEvent = null;
            }

            window.addEventListener('keydown', (event) => {
   if (event.key === 'Escape') {
       closeModal();
   }
            });

            window.onclick = (event) => {
   const modal = document.getElementById('eventModal');
   if (event.target === modal) {
       closeModal();
   }
            };