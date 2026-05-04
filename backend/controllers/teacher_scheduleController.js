const { supabase } = require("../config/db");

// ─── Helper ───────────────────────────────────────────────────────────────────

const mapScheduleItem = (item) => {
  const section = item.course_sections || {};
  const course = section.courses || {};

  return {
    scheduleId: item.id,
    classDate: item.class_date,
    periodStart: item.period_start,
    periodEnd: item.period_end,
    room: item.room,
    sessionType: item.session_type,
    courseId: course.id,
    courseName: course.name,
    sectionId: section.id,
    enrolledCount: section.enrolled_count,
    tenMH: course.name || "",
    maLopHP: section.id || "",
    maMH: course.id || "",
    tietBD: item.period_start != null ? String(item.period_start) : "",
    tietKT: item.period_end != null ? String(item.period_end) : "",
    phongHoc: item.room || "",
    siSoHienTai: section.enrolled_count ?? 0,
  };
};

// ─── Get Teacher Schedule ─────────────────────────────────────────────────────

exports.getTeacherSchedule = async (req, res) => {
  const { teacherId } = req.params;
  const { startDate, endDate } = req.query;

  if (!teacherId) {
    return res.status(400).json({ message: "Missing teacher ID" });
  }

  try {
    let query = supabase
      .from("teacher_schedules")
      .select(`
        id, class_date, period_start, period_end, room, session_type,
        course_sections(id, enrolled_count, courses!course_sections_course_id_fkey(id, name))
      `)
      .eq("teacher_id", teacherId);

    if (startDate && endDate) {
      query = query.gte("class_date", startDate).lte("class_date", endDate);
    }

    const { data, error } = await query.order("class_date").order("period_start");
    if (error) throw error;

    res.json((data || []).map(mapScheduleItem));
  } catch (err) {
    console.error("Error fetching teacher schedule:", err?.message || err);
    res.status(500).json({
      message: "Error fetching schedule",
      detail: err?.message || String(err),
      hint: err?.hint,
    });
  }
};

// ─── Get Schedule By Week ─────────────────────────────────────────────────────

exports.getScheduleByWeek = async (req, res) => {
  const { teacherId } = req.params;
  const { weekStart } = req.query;

  if (!teacherId || !weekStart) {
    return res.status(400).json({ message: "Missing teacher ID or week start date" });
  }

  try {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const formattedStart = start.toISOString().split("T")[0];
    const formattedEnd = end.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("teacher_schedules")
      .select(`
        id, class_date, period_start, period_end, room, session_type,
        course_sections(id, enrolled_count, courses!course_sections_course_id_fkey(id, name))
      `)
      .eq("teacher_id", teacherId)
      .gte("class_date", formattedStart)
      .lte("class_date", formattedEnd)
      .order("class_date")
      .order("period_start");

    if (error) throw error;

    const mapped = (data || []).map(mapScheduleItem);
    const weeklySchedule = {
      monday: [], tuesday: [], wednesday: [], thursday: [],
      friday: [], saturday: [], sunday: [],
    };

    mapped.forEach((item) => {
      const dow = new Date(item.classDate).getDay();
      switch (dow) {
        case 0: weeklySchedule.sunday.push(item); break;
        case 1: weeklySchedule.monday.push(item); break;
        case 2: weeklySchedule.tuesday.push(item); break;
        case 3: weeklySchedule.wednesday.push(item); break;
        case 4: weeklySchedule.thursday.push(item); break;
        case 5: weeklySchedule.friday.push(item); break;
        case 6: weeklySchedule.saturday.push(item); break;
      }
    });

    res.json({ weekStart: formattedStart, weekEnd: formattedEnd, schedule: weeklySchedule });
  } catch (err) {
    console.error("Error fetching weekly schedule:", err?.message || err);
    res.status(500).json({
      message: "Error fetching weekly schedule",
      detail: err?.message || String(err),
      hint: err?.hint,
    });
  }
};

// ─── Get Available Weeks ──────────────────────────────────────────────────────

exports.getAvailableWeeks = async (req, res) => {
  const { teacherId } = req.params;

  if (!teacherId) {
    return res.status(400).json({ message: "Missing teacher ID" });
  }

  try {
    const { data, error } = await supabase
      .from("teacher_schedules")
      .select("class_date")
      .eq("teacher_id", teacherId);

    if (error) throw error;

    const weeksMap = {};
    (data || []).forEach((item) => {
      if (!item.class_date) return;
      const d = new Date(item.class_date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const startStr = start.toISOString().split("T")[0];

      if (!weeksMap[startStr]) {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const dateObj = new Date(start.getTime());
        dateObj.setUTCDate(dateObj.getUTCDate() + 4 - (dateObj.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(dateObj.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((dateObj - yearStart) / 86400000) + 1) / 7);
        const weekNumber = parseInt(`${dateObj.getUTCFullYear()}${weekNo.toString().padStart(2, "0")}`);
        weeksMap[startStr] = {
          weekNumber,
          weekStart: startStr,
          weekEnd: end.toISOString().split("T")[0],
          _ts: start.getTime(),
        };
      }
    });

    const results = Object.values(weeksMap)
      .sort((a, b) => a._ts - b._ts)
      .map(({ _ts, ...w }) => w);

    res.json(results);
  } catch (err) {
    console.error("Error fetching available weeks:", err);
    res.status(500).json({ message: "Error fetching available weeks" });
  }
};
