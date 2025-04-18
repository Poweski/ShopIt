const BASE_URL = 'http://localhost:3000/api/announcements';

export const fetchAnnouncements = async () => {
  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`${response.status} - ${errorData.message}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error fetching announcements:', err);
    throw err;
  }
};

export const getAnnouncement = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`${response.status} - ${errorData.message}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error getting announcement:', err);
    throw err;
  }
};

export const addAnnouncement = async (title, header, content, color) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, header, content, color, visible: true }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`${response.status} - ${errorData.message}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error adding announcement:', err);
    throw err;
  }
};

export const editAnnouncement = async (id, title, header, content, color, visible) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, header, content, color, visible }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`${response.status} - ${errorData.message}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error editing announcement:', err);
    throw err;
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`${response.status} - ${errorData.message}`);
    }
  } catch (err) {
    console.error('Error deleting announcement:', err);
    throw err;
  }
};
